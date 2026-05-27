import { callWithRetry, generateAIContentRaw, safeJsonParse, getMoodContext, getSystemPrompt, MoodType } from './gemini';
import { PersonaType, EpisodeScene } from '../types';
import { IdentityMiddleware } from '../core/middlewares/IdentityMiddleware';

import { MasterOutline } from '../types';

export async function executeAgent1_Scriptwriter(
  topic: string, 
  design: MasterOutline,
  targetDurationMinutes: number,
  mood: MoodType,
  persona: PersonaType,
  engine: string,
  onChunk?: (text: string) => void,
  strategy: "HCS" | "HAP" = "HCS",
  suspenseLevel: number = 5
) {
  const moodContext = getMoodContext(mood);
  const totalWords = targetDurationMinutes * 130;
  const chapters = design.chapters || [];
  const wordsPerChapter = Math.round(totalWords / Math.max(1, chapters.length));

  let fullScript = "";
  let rollingContext = "";

  const strategyInstructions = strategy === "HCS" 
    ? `STRUCTURE PROTOCOL: [HCS]
    1. Hook (صادم): A sharp, unexpected entry into the subject.
    2. Context (سريع): Explain the problem or the scale of the mystery contextually.
    3. Setup (خطوات الحل): Outline the investigative steps we will take today.`
    : `STRUCTURE PROTOCOL: [HAP]
    1. Hook (صادم): A sharp, unexpected entry into the subject.
    2. Authority (إثبات جدارة): Mention a rare archive, a unique witness, or why our investigation is superior.
    3. Promise (وعد بالنهاية): Promise one specific, terrifying or enlightening secret at the very end of the video.`;

  // Pre-generate Thumbnail blueprint
  let thumbnail_blueprint = { prompt: design.thumbnail.image_prompt, text: design.thumbnail.text_on_image, mood_color_instructions: "Default" };

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    if (onChunk) onChunk(`[WRITING] // Micro-Chunking Chapter ${i+1}/${chapters.length} : ${chapter.chapter_title}`);
    
    // Check if it's the isolated climax node (last chapter)
    const isClimax = i === chapters.length - 1;
    const isIntro = i === 0;

    let chapterPositionInstruction = "";
    if (isIntro) {
      chapterPositionInstruction = `\n[INTRO HOOK - MASTERPIECE OPENING]:
   - This is the FIRST chapter. You MUST start with a brilliant, highly engaging hook.
   - If the mood is "طريقة الدحيح", start with a seemingly unrelated, funny, or crazy real-life story/analogy that smoothly ties into the massive complex topic.
   - Define the main question of the entire ${targetDurationMinutes}-minute video immediately to lock the viewer in.`;
    }

    if (isClimax) {
      chapterPositionInstruction += `\n[GUILLOTINE ENDING (SYSTEM_OVERRIDE)]:
   - This is the FINAL chapter. You must provide a comprehensive, philosophical, or mind-blowing conclusion.
   - If the mood is "طريقة الدحيح", give the "الخلاصة" (the ultimate takeaway) with a smart, witty wrap-up, and tie it back to the very first hook.
   - End with a sharp sentence that leaves the audience breathless. DO NOT say "شكراً للمتابعة".`;
    }

    const basePrompt = `[Agent: "حبكة" Master Scriptwriter]
${getSystemPrompt()}
Mood: ${moodContext.scriptingStyle}
Strategy: ${strategy}
Suspense Level (1-10): ${suspenseLevel}

Task: Write the voiceover script exclusively for THIS chapter of the episode.
Topic: ${topic}
Chapter Title: ${chapter.chapter_title}
Chapter Description & Points: ${chapter.chapter_description} | ${chapter.key_points?.join(" - ")}
CONFIDENCE SCORE TARGET: Focus heavily on historical hard-facts.
Target length for THIS chapter: ~${wordsPerChapter} words (Extremely dense!). YOU MUST WRITE A VERY LONG AND COMPREHENSIVE TEXT FOR THIS CHAPTER. Explain all details.

[Global Document / Context]:
${design.research_data}

[PREVIOUS ROLLING CONTEXT (To continue flawlessly and avoid loops)]:
${rollingContext ? rollingContext : "This is the very first chapter."}

=== NARRATIVE DNA RULES (CRITICAL) ===
1. ${strategyInstructions}
   * NOTE: Suspense Level is ${suspenseLevel}/10.

2. OPEN LOOPS (O/C Logic):
   - Only open loops if it fits this chapter. Mark with [[O:loop_id:hint]].
   - Close prior loops if relevant: [[C:loop_id]].

3. SOUND MARKS ENGINEERING:
   - Insert [PAUSE: 2s] for dramatic silence. [SFX: heartbeat], [BGM: dark ambient].

4. DIALECT & DELIVERY PROTOCOL:
   - Voice and personality MUST match the user's selected Persona.
   - If Daheeh style is active, use highly energetic, relatable Egyptian pop-science slang.
   - STRICT ANTI-CLICHE LINTER: NEVER use "يا عزيزي", "بص يا سيدي", "مقدمة", "عشان نوضح أكتر".

5. RAG-CITATION RULE (STRICT):
   - Cite information by appending [SOURCE: ID] immediately after the fact.

${chapterPositionInstruction}

Output strict JSON:
{
  "chapter_script": "The full voiceover text for this chapter only..."
}
`;

    const prompt = IdentityMiddleware.injectPersona(basePrompt, 'story-001');

    const rawContent = await callWithRetry(async () => {
      // Throttling protection for Ollama stability
      const delayMs = engine === "ollama" ? 8000 : 3000;
      await new Promise(r => setTimeout(r, delayMs));

      // Use a lower temperature for drafting to avoid Korean hallucinations & repeated dots
      return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.65);
    });

    let parsed = safeJsonParse(rawContent, { chapter_script: "" });
    let cleanedChunk = IdentityMiddleware.applyStyleGuard(parsed.chapter_script || "");
    
    // Add the chunk to the full script
    fullScript += cleanedChunk + "\n\n";

    // Update rolling context (last 3-4 sentences)
    const trailingSentences = cleanedChunk.split(/[.!?]+/).filter(Boolean).slice(-4).join(". ") + ".";
    rollingContext = `The last chapter ended discussing: "${trailingSentences}"`;
  }

  return fullScript;
}

export async function executeAgent2_Director(
  masterScript: string,
  engine: string,
  onChunk?: (text: string) => void
) {
  // Split master script into chunks of max 500 words to avoid JSON token limits
  const words = masterScript.split(/\s+/);
  const CHUNK_SIZE = 500;
  const scriptChunks = [];
  
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    scriptChunks.push((words || []).slice(i, i + CHUNK_SIZE).join(" "));
  }

  let allScenes: any[] = [];
  
  for (let i = 0; i < scriptChunks.length; i++) {
    const prompt = `[Agent: Director/Editor]
Task: Receive a segment of the master script and divide it into logical, sequential scenes.
Account for exact 'estimated_duration_seconds' for each scene (approx 2 words per second).
Continue numbering scenes starting from index ${allScenes.length + 1}.

Master Script Segment (${i + 1}/${scriptChunks.length}):
"""
${scriptChunks[i]}
"""

Rules:
1. Divide this script segment into scenes based on narrative beats.
2. For each scene, estimate the duration in seconds.

Output strict JSON:
{
  "scenes": [
    {
      "scene_id": "string (e.g. '[Scene ${String(allScenes.length + 1).padStart(2, "0")}]')",
      "voiceover_text": "string (the exact segment from master script)",
      "voiceover_notes": "string (notes for VO artist: tone, speed, emotion)",
      "estimated_duration_seconds": number,
      "loop_type": "O" | "C" | null,
      "loop_id": "string | null",
      "visual_treatment": "string (Directorial Metadata for editor: e.g. Smooth Slow-Mo, Speed Ramping)",
      "stock_search_queries": [
        { "platform": "pexels" | "mixkit" | "freesound", "query": "string + licensing tags" }
      ],
      "archival_quotes": [
        {
          "speaker": "string (Name of the public figure)",
          "quote_text": "string (The exact historical quote or testimony found in the script)",
          "source_context": "string (Where/when it was said, e.g. '1998 TV Interview')",
          "is_audio_available": "boolean"
        }
      ]
    }
  ]
}
Note: 
- For 'freesound', always append 'license:cc0' or 'license:attribution'.
- For 'pexels/mixkit', append keywords like 'Free License' or 'High Quality'.
- Map visual_treatment to Mood:
  * Nabbash/Cold -> Smooth Slow-Mo + Depth of Field.
  * Black Box -> Aggressive Speed Ramping.
  * Architectural -> Grainy Textures + Static Wide Shots.
- If a scene contains an [[O:id:...]] marker, set loop_type to 'O' and loop_id to 'id'. If it contains [[C:id]], set loop_type to 'C' and loop_id to 'id'.
`;

    try {
      const rawContent = await callWithRetry(async () => {
        return await generateAIContentRaw(prompt, null, engine, onChunk);
      });
      
      const parsed = safeJsonParse(rawContent, { scenes: [] });
      // Filter out invalid/truncated scenes
      const validScenes = (parsed?.scenes || []).filter((s:any) => s && s.voiceover_text && String(s.voiceover_text).trim().length > 0);
      allScenes = [...allScenes, ...validScenes];
    } catch (err) {
      console.warn("Failed to process script chunk", i, err);
    }
  }
  
  return allScenes;
}

function getCreativeFraming(mood: MoodType): string {
  switch (mood) {
    case "أرشيف الضلمة":
    case "ملفات متقفلش":
      return "Framing: The scene is viewed as if it's a glowing projection illuminating a smoky, dark investigations room. Or seen through the lens of a microfiche reader, with forensic markings on the edges.";
    case "خرافات شعبية":
    case "حكاوي الأجداد":
    case "حواديت شوارع":
      return "Framing: The scene is illustrated within the jagged, torn pages of an ancient, dusty leather-bound manuscript. Intricate arabesque borders frame the image, with ink spillage and candle-lit ambiance surrounding the book.";
    case "صراع العروش العربي":
      return "Framing: The scene is woven into a massive, grand historical tapestry hanging on a stone wall, or painted as a mural in a royal Mamluk palace with flaking gold leaf and distressed plaster.";
    case "تكنولوجيا مرعبة":
    case "سبوبة ولا ابتكار":
      return "Framing: The scene is viewed through the distorted, fragmented panels of a shattered CRT monitor or holographic display. Glitch art elements, cyberpunk HUD overlays, and neon scanlines border the main image.";
    case "كلاكيت وتزوير":
      return "Framing: The scene is presented as a stack of vintage, sepia-toned Polaroid photos scattered on a messy director's desk, with red marker circles and 'Classified' stamps overlaying the images.";
    case "اقتصاد الشارع":
      return "Framing: The scene is depicted as a gritty, chaotic graffiti mural painted on a textured, weathered brick wall in a bustling alleyway, framed by peeling posters and neon signs.";
    default:
      return "Framing: The scene is framed creatively within its thematic setting, avoiding standard full-screen presentation. Use physical mediums like vintage photos scattered on a desk, a projection on a smoky wall, or a page in an old book.";
  }
}

export async function executeAgent3_ArtDirector(
  sceneSegment: any,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void,
  globalVisualCondition?: string
) {
  const moodContext = getMoodContext(mood);
  const framingContext = getCreativeFraming(mood);
  
  const basePrompt = `[Agent: "عين" (Art Director) - Hybrid Cinematic & Archival System]
Task: Generate pristine, Culturally-Anchored visual directions for this specific scene.
You are 'Ain', the master Art Director for a premium documentary channel.

Scene segment:
${JSON.stringify(sceneSegment, null, 2)}

=== GLOBAL VISUAL CONDITION (MANDATORY THEME) ===
${globalVisualCondition ? globalVisualCondition : "Hybrid Style: Cinematic Realism mixed with Archival Charcoal/Ink aesthetics."}

=== CREATIVE FRAMING RECOMMENDER ===
Instead of generating the frame inside the image, we now use Video Editing Green-Screen templates.
Your task is to recommend one of the following Template IDs for this scene:
- "old_tv": Best for retro tech, broadcasts, intense monitoring.
- "archival_book": Best for history, myths, ancient stories.
- "classified_folder": Best for investigations, crimes, secrets.
- "hologram_projector": Best for sci-fi, modern tech, future analysis.
- "FULLSCREEN": If no template is needed and the scene should just be a regular cinematic shot.
Generate the actual 'image_prompt' as a clean, full-screen cinematic shot (without placing it inside a book/tv). The video editor will handle inserting it into the template.

=== THE VISUAL DILEMMA (ANTI-ORIENTALISM PROTOCOL) ===
CRITICAL: To avoid "Western Bias" and Orientalist tropes (Aladdin style, stereotypical bazaars, generic middle-eastern slop), you MUST use cultural anchors.
- Use explicit architectural anchors (e.g., Mamluk architecture, Fatimid motifs, Cairene alleyways "Hara").
- Emphasize lighting: Chiaroscuro, 35mm film grain, moody shadows, olive-brown tones.
- NEGATIVE PROMPTS (Always append to image ideas): Do NOT use European facial features, do not use Aladdin styles, no shiny golden domes unless historically accurate.

=== THE MIDJOURNEY PROMPT FORMULA (MANDATORY) ===
To prevent historical inaccuracies (anachronisms) and cultural misrepresentation, the "image_prompt" MUST follow this exact structure:
<Main Subject> in <EXACT ERA/YEAR, e.g., 1960s, Ancient Egypt, 12th Century> <EXACT LOCATION, e.g., Cairo, Desert> -- Wardrobe: <Historically accurate clothing> -- Atmosphere: <Lighting & film stock, e.g., 35mm, chiaroscuro> --no modern tools, modern clothing, smartphones, European facial features, western architecture

Example 1 (Historical): An exhausted Abbasid caliph sitting in a royal tent in 8th Century Baghdad, smoking a traditional shisha -- Wardrobe: Authentic Abbasid robes and turban -- Atmosphere: Cinematic lighting, dimly lit with oil lamps --no modern furniture, modern clothes, european features
Example 2 (1960s): Two Egyptian men whispering in a cafe in 1960s Cairo -- Wardrobe: 1960s vintage suits and tarboush -- Atmosphere: 35mm film grain, sepia tone --no modern cars, smartphones, modern fashion, european features

=== OUTPUT PROTOCOL ===
Generate a highly descriptive prompt for the visual engine.
1. "recommended_template": (e.g. "old_tv", "archival_book", "classified_folder", "hologram_projector", or "FULLSCREEN")
2. "image_prompt": The precise english generative AI prompt (CLEAN SHOT, DO NOT MENTION TV/BOOK IN PROMPT).
3. "multi_camera_angles": An array of 3 distinct directorial angles for the editor (e.g. Wide, Close-Up, Dutch Angle) with lens descriptors.
4. "b_roll_search_query": Stock video search query (Pexels).
5. "sfx": Arabic SFX description.

Output strict JSON:
{
  "recommended_template": "string",
  "image_prompt": "string",
  "multi_camera_angles": [
    { "type": "Wide Angle", "description": "Establishing shot of...", "lens": "24mm" },
    { "type": "Close-Up", "description": "Tight on the eyes...", "lens": "85mm macro" }
  ],
  "b_roll_search_query": "string (ENGLISH ONLY)",
  "sfx": "string"
}
`;

  const prompt = IdentityMiddleware.injectPersona(basePrompt, 'viz-001');

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, {});
  });
}

export async function executeAgent_Editor(
  scriptSequence: string,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const prompt = `[Agent: "مقص" The Razor Editor]
Task: Receive a block of script and violently cut the fat.
Remove any redundant adjectives, circular reasoning, or padding. Maintain the core facts and exactly the same narrative structure, but make the pacing 20% faster by removing unnecessary fluff.

Original Script:
${scriptSequence}

Output ONLY the final Arabic text. No JSON, no pleasantries.`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.4);
    return rawContent;
  });
}

export async function executeAgent_SceneRefiner(
  scene: EpisodeScene,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void
): Promise<{ voiceover_text: string }> {
  const prompt = `[Agent: Scene Refiner - A/B Testing Mode]
Task: Rewrite the voiceover for this specific scene to match the current engine's (${engine}) style while keeping the core facts.

Original Scene:
${JSON.stringify(scene, null, 2)}

Requirements:
1. Maintain the White Cairene (Analytical/Mysterious) tone.
2. Adapt the phrasing to be more unique to this engine.
3. Keep the approximate duration.

Output strict JSON:
{
  "voiceover_text": "The rewritten script segment..."
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { voiceover_text: scene.voice_over });
  });
}

export async function executeAgent4_Reviewer(
  scriptContext: string,
  mood: MoodType,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<string> {
  const basePrompt = `[Agent: "المُوَثِّق" The Historian / Documentarian]
Task: You are the terrifyingly strict Fact-Checker and Editor.
Your job: Review the generated script.
1. Hunt for historical hallucinations or dramatic exaggerations. Fix them instantly.
2. Enforce the "White Cairene Arabic" (العامية القاهرية البيضاء) tone.
3. Remove ALL cheap cliches ("يا عزيزي", "هل تساءلت يوماً", "في هذا الفيديو", "بص يا سيدي").
4. Ensure the pacing is rapid and dense. 
Fix the script directly. Output ONLY the final, polished Arabic script. DO NOT add any introductions, json blocks, or pleasantries.

Script to review and fix:
${scriptContext}
`;

  const prompt = IdentityMiddleware.injectPersona(basePrompt, persona);
  
  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.4); // Low temp for facts
    return IdentityMiddleware.applyStyleGuard(rawContent);
  });
}


export async function executeAgent5_Publisher(
  videoTitle: string,
  researchMapStr: string,
  mood: MoodType,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{ 
  youtube_titles: string[], 
  thumbnail_prompt: string, 
  description: string, 
  tags: string[],
  chapters: { title: string, timestamp: string }[],
  omnichannel?: any,
  shorts?: any[]
}> {
  const moodContext = getMoodContext(mood);
  const basePrompt = `[Agent: "الناشر" Publisher & Omnichannel Manager]
You are a master digital strategist and copywriter.
Your task is to generate the final packaging metadata AND spin-off content (Shorts, Threads, Social Posts) from the research map.

Video Title Idea: "${videoTitle}"
NARRATIVE MOOD (Mode Inheritance): ${moodContext.scriptingStyle}

Research Map:
${researchMapStr}

RULES (CRITICAL):
1. A/B Titles (youtube_titles): 3 highly mysterious, intellectual titles matching the Mood. No cheap clickbait.
2. Description: A professional, dark description teasing the episode's knot.
3. Chapters: 4-7 timestamps.
4. Tags: 10-15 highly relevant SEO keywords.
5. Thumbnail Prompt: Midjourney AI prompt (in English) for a cinematic thumbnail.
   ${mood === 'تشريح الحكايات' ? `
   - THUMBNAIL DNA: MUST be in (Hand-drawn Ink Sketch on Vintage Yellow Paper) style.
   - COMPOSITION: Use "Double Exposure" technique.
   ` : "- Describe a dark, intriguing, cinematic thumbnail."}
6. Shorts (3 Scripts): Extract 3 mini-stories. Each needs a 'hook', 'body', and 'cta'. Follow the Mood.
7. Twitter Thread: A 3-to-5 part threading summarizing the most mind-blowing fact.
8. Social Posts: 1 Facebook/LinkedIn, 1 Instagram post.

Output STRICT JSON matching this schema exactly:
{
  "youtube_titles": ["title 1", "title 2", "title 3"],
  "description": "string",
  "thumbnail_prompt": "string",
  "tags": ["tag1", "tag2"],
  "chapters": [ { "title": "Intro...", "timestamp": "00:00" } ],
  "shorts": [ { "title": "string", "hook": "string", "body": "string", "cta": "string", "visual_instructions": "string" } ],
  "omnichannel": {
    "twitter_thread": ["string", "string"],
    "social_posts": [ { "platform": "Facebook", "content": "string" } ]
  }
}
`;

  const prompt = IdentityMiddleware.injectPersona(basePrompt, persona);

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(
      prompt, 
      {
        type: "OBJECT",
        properties: {
          youtube_titles: { type: "ARRAY", items: { type: "STRING" } },
          description: { type: "STRING" },
          thumbnail_prompt: { type: "STRING" },
          tags: { type: "ARRAY", items: { type: "STRING" } },
          chapters: { 
            type: "ARRAY", 
            items: { 
              type: "OBJECT", 
              properties: { title: { type: "STRING" }, timestamp: { type: "STRING" } },
              required: ["title", "timestamp"]
            } 
          },
          shorts: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                hook: { type: "STRING" },
                body: { type: "STRING" },
                cta: { type: "STRING" },
                visual_instructions: { type: "STRING" }
              },
              required: ["title", "hook", "body", "cta", "visual_instructions"]
            }
          },
          omnichannel: {
            type: "OBJECT",
            properties: {
              twitter_thread: { type: "ARRAY", items: { type: "STRING" } },
              social_posts: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    platform: { type: "STRING" },
                    content: { type: "STRING" }
                  },
                  required: ["platform", "content"]
                }
              }
            },
            required: ["twitter_thread", "social_posts"]
          }
        },
        required: ["youtube_titles", "description", "thumbnail_prompt", "tags", "chapters", "shorts", "omnichannel"]
      }, 
      engine, 
      onChunk,
      undefined,
      false,
      0.6
    );
    return safeJsonParse(rawContent, {
      youtube_titles: [],
      description: "",
      thumbnail_prompt: "",
      tags: [],
      chapters: [],
      shorts: [],
      omnichannel: { twitter_thread: [], social_posts: [] }
    });
  });
}

export async function executeAgent6_ArchiveSearch(
  topic: string,
  script: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{ 
  archives: { title: string, url: string, description: string }[],
  notable_quotes: { speaker: string, quote: string, source: string, fallback_strategy?: string }[]
}> {
  const prompt = `[Agent: Archival Research Specialist (Archive_Researcher_Agent)]
You are a master researcher tasked with finding REAL archival sources, search queries, and historical quotes for a video about "${topic}".
Based on this script:
${script.substring(0, 2000)}

Task:
1. Provide 3-5 specific search queries that would yield historical footage or documents on Archive.org, YouTube, or OpenLibrary.
2. If you know specific real collections (like 'Associated Press', 'British Pathé', or 'Egyptian National Archives'), list them.
3. Provide 2-3 notable, highly dramatic historical quotes OR testimonies from public figures related to the topic. 
4. Fallback Strategy: If this topic/figure is too ancient to have video/audio archives, provide a 'fallback_strategy' (e.g., 'Rely on written letters from 1920', 'Use newspaper headlines').

Output STRICT JSON:
{
  "archives": [
    { "title": "string", "url": "string (URL or search query)", "description": "string" }
  ],
  "notable_quotes": [
    { "speaker": "string", "quote": "string", "source": "string", "fallback_strategy": "string (optional)" }
  ]
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { archives: [], notable_quotes: [] });
  });
}

export async function executeAgent7_ComplianceAudit(
  script: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{ 
  risks: { severity: 'low' | 'medium' | 'high' | 'critical', finding: string, fix: string }[],
  historical_accuracy: { statement: string, status: 'verified' | 'unverified' | 'contested', notes: string }[]
}> {
  const prompt = `[Agent: Compliance & Truth Auditor]
Review the following script segment for potential regional (Middle East) sensitivities, YouTube demonetization risks, and factual grounding.

Script:
${script.substring(0, 3000)}

Audit Criteria:
1. SENSITIVITY: Identify if the content might be banned or restricted in specific MENA countries.
2. DEMONETIZATION: Check for trigger words or violent imagery descriptions that hurt SEO.
3. ACCURACY: Identify specific factual claims and flag them if they seem unverified.

Output STRICT JSON:
{
  "risks": [
    { "severity": "medium", "finding": "Description of [Topic] might trigger restricted mode.", "fix": "Phrasing suggestion..." }
  ],
  "historical_accuracy": [
    { "statement": "Fact X", "status": "verified", "notes": "Found in [Source]" }
  ]
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { risks: [], historical_accuracy: [] });
  });
}

export async function executeAgent8_EchoChamber(
  script: string,
  topic: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{
  skeptics: { user: string, comment: string, rebuttal_tip: string }[],
  hype_men: { user: string, comment: string, viral_hook: string }[],
  critics: { user: string, comment: string, risk_factor: string }[]
}> {
  const prompt = `[Agent: Echo Chamber Simulator]
Analyze the provided script and simulate audience reactions in 3 distinct personas.
Script: ${script.substring(0, 2000)}
Topic: ${topic}

Simulate:
1. SKEPTICS (المشككين): Smart users who look for contradictions or lack of sources. Provide a tip on how to address them in the video.
2. HYPE-MEN (المنبهرين): Core fans who love the storytelling. Identify what "moment" will make them share the video.
3. CRITICS (المعترضين): Users who might disagree on ideological or social grounds. Point out the "conflict" they will ignite.

Output STRICT JSON:
{
  "skeptics": [{ "user": "@user_handle", "comment": "string", "rebuttal_tip": "string" }],
  "hype_men": [{ "user": "@user_handle", "comment": "string", "viral_hook": "string" }],
  "critics": [{ "user": "@user_handle", "comment": "string", "risk_factor": "string" }]
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { skeptics: [], hype_men: [], critics: [] });
  });
}

export async function executeAgent9_KnowledgeLinker(
  topic: string,
  researchMap: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{ 
  suggested_links: { title: string, connection_logic: string, loop_strategy: string }[] 
}> {
  const prompt = `[Agent: Knowledge Loop Strategist]
Based on the current topic "${topic}" and Research Map, suggest 3 thematic connections to *hypothetical* or *existing* episodes in a "Director's" universe.

Research Map:
${researchMap.substring(0, 1000)}

Task:
Suggest 3 links that would create a "Viewership Loop" (e.g. "If you loved the mystery of X, you must see our analysis of Y").

Output STRICT JSON:
{
  "suggested_links": [
    { "title": "Other Topic X", "connection_logic": "How it links to current script", "loop_strategy": "The exact sentence to use for the loop" }
  ]
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { suggested_links: [] });
  });
}

export async function executeAgent10_DevilsAdvocate(
  script: string,
  topic: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{
  fatal_flaws: { quote: string, flaw: string, counter_argument: string }[],
  narrative_gaps: { missing_element: string, why_it_matters: string }[],
  verdict: string,
  red_team_score: number
}> {
  const prompt = `[Agent: "محامي الشيطان" - The Devil's Advocate (Red Team)]
You are the ultimate Red Team editor for documentary scripts. 
Your job is to violently attack the logic, narrative flow, and factual basis of the script to make it bulletproof.
Do NOT be polite. Look for:
1. Logical leaps or missing evidence (Fatal Flaws).
2. Missing perspectives or counter-arguments that the viewer will immediately think of (Narrative Gaps).

Topic: ${topic}
Script:
${script.substring(0, 3000)}

Output STRICT JSON:
{
  "fatal_flaws": [
    { "quote": "the weak sentence from script", "flaw": "why this is illogical or weak", "counter_argument": "the skeptic's argument" }
  ],
  "narrative_gaps": [
    { "missing_element": "what did the writer ignore?", "why_it_matters": "how this hurts credibility" }
  ],
  "verdict": "Brutal 1-sentence summary of the script's weakness in Arabic",
  "red_team_score": 85
}
Note: red_team_score is 0-100 (100 being bulletproof).
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { fatal_flaws: [], narrative_gaps: [], verdict: "", red_team_score: 0 });
  });
}
