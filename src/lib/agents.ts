import { callWithRetry, generateAIContentRaw, safeJsonParse, getMoodContext, getSystemPrompt, MoodType, Type } from './gemini';
import { PersonaType, EpisodeScene } from '../types';
import { IdentityMiddleware } from '../core/middlewares/IdentityMiddleware';
import { getChannelDNA } from '../config/channelDNA';

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

[ANTI-REPETITION QA WAKIL (وكيل المراجعة الصارم)]:
CRITICAL: You MUST NOT repeat any facts, stories, or jokes that were just mentioned in the rolling context above. Advance the plot forward continuously.

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
   - You MUST write the script entirely in 100% Egyptian slang (العامية المصرية الدارجة). NO Fusha (Modern Standard Arabic).
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


function calculateSimilarityScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9أ-ي]/g, '');
  const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9أ-ي]/g, '');
  if (s1 === s2) return 1;
  // If one contains the other entirely and is reasonably long
  if ((s1.includes(s2) && s2.length > 20) || (s2.includes(s1) && s1.length > 20)) return 0.9;
  return 0;
}

export async function executeAgent2_Director(
  masterScript: string,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void,
  onProgressUpdate?: (p: number, status: string) => void,
  isVertical?: boolean
) {
  if (!masterScript || masterScript.trim().length === 0) {
     throw new Error("Fox Error: MasterScript is empty. The director cannot work with a void.");
  }
  
  if (masterScript.length < 50 || masterScript.includes("لم تزودني") || masterScript.includes("الخانات فاضية") || masterScript.includes("لا يمكنني إتمام")) {
     throw new Error("Fox Error: Input validation failed. MasterScript seems to be an AI hallucination or complaint rather than an actual script. Pipeline aborted.");
  }

  // Use a sentence-based split for strict boundaries to ensure we never cut a thought perfectly in half.
  // Instead of word-count splits which break chunks, we split by paragraphs/double newlines.
  // Split by anything that looks like a sentence boundary, falling back to lines
  const rawSentences = masterScript.match(/[^.!?\n]+[.!?\n]*/g) || [masterScript];
  const scriptChunks = [];
  let currentChunkArr: string[] = [];

  for (let i = 0; i < rawSentences.length; i++) {
    const sentence = rawSentences[i].trim();
    if (!sentence) continue;
    
    currentChunkArr.push(sentence);
    const chunkWordCount = currentChunkArr.join(" ").split(/\s+/).length;
    
    // Strict chunking: limit by words to prevent JSON truncation
    if (chunkWordCount > 300) {
      scriptChunks.push(currentChunkArr.join(" "));
      currentChunkArr = [];
    }
  }
  if (currentChunkArr.length > 0) {
     scriptChunks.push(currentChunkArr.join(" "));
  }

  let allScenes: any[] = [];
  let previous_visual_context = "None. This is the very first scene."; // INITIAL STATE
  let previous_image_prompt = "None";

  for (let i = 0; i < scriptChunks.length; i++) {
    if (onProgressUpdate) {
        const progressVal = 50 + Math.floor((10 * i) / scriptChunks.length);
        onProgressUpdate(progressVal, `[!] فوكس (المخرج): معالجة المشاهد المرئية جزء ${i + 1} من ${scriptChunks.length}...`);
    }
    const verticalFormattingInstruction = isVertical 
      ? "\n[9:16 VERTICAL FRAMING MANDATE]\n- You MUST structure scenes and visual details specifically for 9:16 portrait vertical layouts (Shorts/Reels).\n- Ensure subjects remain centered in the middle of the frame. Mention '9:16 vertical orientation, tall portrait aspect ratio, central focus' in your image_prompt concepts.\n- All key visual cues must leave safe spaces on top and bottom to avoid mobile app overlays."
      : "";

    const prompt = `[Agent: Fox - Master Visual Director]
Task: You are the visual overlay director. You receive raw spoken script. You must map it into highly precise visual scenes.${verticalFormattingInstruction}
Crucial Zero-Drop Rule: You MUST map EVERY SINGLE WORD and SENTENCE from the script segment exactly into the scenes.
CRITICAL PACING RULE: MINIMIZE the number of scenes! Group the narration into LARGE, cohesive blocks (approx 45-60+ seconds or 100+ words per scene). Do NOT create a new scene for every single sentence.
CRITICAL QUALITY ASSURANCE OUTRIGHT REJECTION RULE: NEVER, EVER repeat a scene, a visual concept, or a script segment that you have already generated. Provide strict continuity! Deduplicate thoughts! (وكيل المراجعة المتشدد سيرفض أي مشهد مكرر)

[MOOD & FORMAT DIRECTIVES]
${getMoodContext(mood).visualAudioStyle}

Script Segment (${i + 1}/${scriptChunks.length}):
"""
${scriptChunks[i]}
"""

[VISUAL CONTEXT CONTINUITY GUARD]
Previous Chunk's Ending Visual Concept: "${previous_visual_context}"
Previous Image Prompt: "${previous_image_prompt}"
Rule: Ensure the new scenes flow seamlessly. You MUST maintain exactly the same visual details from the 'Previous Image Prompt' (e.g., if a character was wearing a military uniform, they must STILL be wearing it. Maintain lighting, colors, and camera flow). If changing scenes, specify it clearly.

[VISUAL-FIRST PROMPTING RULE]
To ensure terrifyingly good audio-visual sync, you MUST reason about the visual FIRST.
In your JSON, output "visual_concept" BEFORE the script lines. 
You must output TWO versions of the script line:
1. "clean_tts": An EXACT mapping from the text provided above, but STRIP OUT any [URL] links or source brackets. ZERO TAGS. Clean for TTS. (MUST INCLUDE ALL ORIGINAL TEXT)
2. "voiceover_text": The EXACT SAME text, but intelligently inject performance pacing tags for a human voice actor. Use tags like [PAUSE] for dramatic pauses, [SPEED: FAST] for fast delivery, and [TONE: MYSTERIOUS] etc. DO NOT alter the actual words!
3. "image_prompt": A highly detailed midjourney-style image generation prompt for the visual concept.
4. "sound_design": Advanced sound design and Foley notes (e.g., 'Low cinematic sub bass drone with distant echoes').
5. "b_roll_search_query": A clean 1-3 word english search query for stock video (e.g. 'cairo rain', 'vintage typewriter'). MUST BE IN ENGLISH.
6. "montage_instructions": Editing instructions for this specific scene (e.g. 'Slow zoom in', 'Fast flashy cuts').

Output strict JSON:
{
  "scenes": [
    {
      "scene_id": "string (e.g. '[Scene ${String(allScenes.length + 1).padStart(2, "0")}]')",
      "visual_concept": "string (Detailed visual imagination of what we see on screen during this exact line. 1950s/cinematic etc.)",
      "clean_tts": "string (The clean TTS version, zero tags)",
      "voiceover_text": "string (The text with pacing tags [PAUSE], [SPEED], [TONE] injected)",
      "image_prompt": "string (A highly detailed text-to-image prompt (english) to generate this scene)",
      "sound_design": "string (Detailed sound design layout)",
      "b_roll_search_query": "string (1-3 English words for Pexels search)",
      "montage_instructions": "string (Editing directions)",
      "estimated_duration_seconds": number (approx 2.5 words per second)
    }
  ]
}`;

    const rawContent = await callWithRetry(async () => {
      const delayMs = engine === "ollama" ? 8000 : 3500;
      await new Promise(r => setTimeout(r, delayMs));
      return await generateAIContentRaw(prompt, {
        type: Type.OBJECT,
        properties: {
          scenes: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                  scene_id: { type: Type.STRING },
                  visual_concept: { type: Type.STRING },
                  clean_tts: { type: Type.STRING },
                  voiceover_text: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  sound_design: { type: Type.STRING },
                  b_roll_search_query: { type: Type.STRING },
                  montage_instructions: { type: Type.STRING },
                  estimated_duration_seconds: { type: Type.INTEGER }
               },
               required: ["scene_id", "visual_concept", "clean_tts", "voiceover_text", "image_prompt", "estimated_duration_seconds"]
             }
          }
        },
        required: ["scenes"]
      }, engine, onChunk, undefined, false, 0.5, true);
    });

    const parsed = safeJsonParse(rawContent, { scenes: [] });
    if (parsed && Array.isArray(parsed.scenes)) {
      // Direct backward compatibility mapping for Orchestrator bounds
      const properlyMapped: any[] = [];
      const reviewAgentRejectLog = [];
      for (const s of parsed.scenes) {
        const text = s.clean_tts || s.script_line || "";
        const visual = s.visual_concept || "";
        
        // Agent 2.5: Deep Scene Reviewer (Deduplication)
        // وكيل المراجعة: فحص التكرار بدقة
        const isDuplicate = [...allScenes, ...properlyMapped].some(existing => {
           const existingText = String(existing.clean_tts || "");
           const existingVisual = String(existing.visual_cue || "");
           if (existingText.length > 5 && text.length > 5 && calculateSimilarityScore(text, existingText) > 0.8) return true;
           if (existingVisual.length > 10 && visual.length > 10 && calculateSimilarityScore(visual, existingVisual) > 0.8) return true;
           return false;
        });

        if (isDuplicate) {
            reviewAgentRejectLog.push(s.scene_id || "Scene");
            continue; // 🚫 Refuse duplicated scene (مرفوض)
        }

        properlyMapped.push({
          scene_id: s.scene_id,
          visual_cue: visual,
          clean_tts: text,
          voice_over: s.voiceover_text || text, 
          image_prompt: s.image_prompt || "",
          sound_design: s.sound_design || "",
          b_roll_search_query: s.b_roll_search_query || "",
          montage_instructions: s.montage_instructions || "",
          estimated_duration_seconds: s.estimated_duration_seconds || 15
        });
      }
      if (reviewAgentRejectLog.length > 0 && onProgressUpdate) {
         onProgressUpdate(100, `[وكيل المراجعة] 🚫 تم رصد ورفض مشاهد مكررة: ${reviewAgentRejectLog.length} مشهد.`);
      }
      
      allScenes.push(...properlyMapped);
      
      if (properlyMapped.length > 0) {
        previous_visual_context = properlyMapped[properlyMapped.length - 1].visual_cue || "None";
        previous_image_prompt = properlyMapped[properlyMapped.length - 1].image_prompt || "None";
      }
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
  
  const basePrompt = `[Agent: "عين" (Art Director) - Hybrid Illustration & Archival System]
Task: Generate pristine, Culturally-Anchored visual directions for this specific scene.
You are 'Ain', the master Art Director for a premium doc channel.

Scene segment:
${JSON.stringify(sceneSegment, null, 2)}

=== GLOBAL VISUAL CONDITION (MANDATORY THEME) ===
CRITICAL VISUAL DNA OVERRIDE: 
Regardless of any global theme, you MUST enforce the following aesthetic for ALL images:
"Authentic vintage editorial illustration, mid-century screen print style, muted earthy color palette, textured parchment paper grain, soft halftone print imperfections, dramatic chiaroscuro lighting, highly detailed historical atmosphere."
Do not use 3D render, photorealism, modern neon, or hacker vibes. Replace them with vintage archival aesthetics.

=== CRITICAL RULE: CONTEXTUAL SYMBOLISM (الرمزية السياقية) ===
CRITICAL RULE: NEVER use generic or cartoonish elements. The aesthetic is serious, tense, and investigative. If abstract elements are needed, they MUST be semantically related to the topic (e.g., floating redacted documents, glowing data nodes, fragmented glass, binary rain, subtle red string investigation boards). They must seamlessly blend with the dark cinematic setting.

=== CRITICAL RULE: THE MAIN PERSONA (THE NARRATOR/AL NABBASH) ===
When the script refers to the narrator, the investigator, or "النبّاش", you MUST use this exact persona description in the prompt:
"A mysterious investigative figure wearing a dark hoodie, face hidden by a smooth, featureless white anonymous mask. One eye hole of the mask glows with a bright, cosmic blue energy resembling a galaxy or starry nebula."
Ensure this figure is placed in dramatic lighting (e.g., sitting in a dark server room, standing under a flickering streetlamp, holding a glowing clue).

=== CRITICAL RULE: NO TEXT OR CALLIGRAPHY IN IMAGES ===
CRITICAL: NEVER use words like 'Calligraphy', 'Letters', or 'Text' in the positive image prompt to avoid generating garbled AI text. Replace them with 'glowing digital data streams' or 'classified redacted documents'.

=== CREATIVE FRAMING RECOMMENDER ===
Instead of generating the frame inside the image, we now use Video Editing Green-Screen templates.
Your task is to recommend one of the following Template IDs for this scene:
- "old_tv": Best for retro tech, surveillance footage, intercepted broadcasts.
- "classified_folder": Best for investigations, crimes, secrets, deep state files.
- "hologram_projector": Best for cyber-analysis, data visualization, modern tech.
- "FULLSCREEN": If no template is needed and the scene should just be a regular cinematic shot.
Generate the actual image prompts as clean, full-screen cinematic shots.

=== THE VISUAL DILEMMA (CINEMATIC THRILLER PROTOCOL) ===
CRITICAL: To maintain the high-end Netflix documentary feel, avoid flat lighting or generic stock photo tropes.
- Use dramatic chiaroscuro lighting, deep shadows (ink black), and sharp, intentional highlights (e.g., neon blue, harsh amber).
- Emphasize cinematic atmosphere: fog, depth of field, anamorphic lens flares, dust motes in light beams.
- NEGATIVE PROMPTS (Always append to image ideas): Do NOT use cartoon, illustration, bright daylight, cheerful colors, flat vector, 3d render, low quality.

=== CINEMATOGRAPHY & FRAMING RULES (ESSENTIAL FOR MONTAGE) ===
CRITICAL: To ensure the generated images look like a high-budget thriller when edited together, you MUST vary the shot sizes and camera angles throughout the scenes. Do not use the same framing repeatedly.
- Define Shot Size: (e.g., Extreme Close-Up (ECU), Close-Up (CU), Medium Shot (MS), Wide Establishing Shot (WS), Ultra-Wide).
- Define Camera Angle: (e.g., Low Angle/Hero shot, High Angle/Vulnerability, God's Eye/Top-down, Dutch Angle/Unease, Over-The-Shoulder).
- Continuity: Shot 1 and Shot 2 in the same scene MUST logically flow together (e.g., Shot 1: Wide Establishing Shot, Shot 2: Medium Close-Up on the subject's hands or the glowing eye of the mask).

=== THE MIDJOURNEY PROMPT FORMULA (MANDATORY) ===
To ensure a highly compelling, dark cinematic aesthetic, the "first_frame_image_prompt" and "second_frame_image_prompt" MUST follow this exact structure:
[Camera Angle & Shot Size] of <Exact Subject / The Narrator> <Action> in <HISTORICAL/VINTAGE SETTING> -- Surroundings: <Subtle contextual metaphors, scattered archival documents> -- Style: Authentic vintage editorial illustration, mid-century screen print style, muted earthy color palette, textured parchment paper grain, soft halftone print imperfections, dramatic chiaroscuro lighting, highly detailed historical atmosphere --ar 16:9 --v 6.0 --no photorealism, 3d render, modern technology, neon, text, typography, letters, words, watermark, cartoon, bright daylight, flat colors

=== CAMERA MOTION PROTOCOL (ENGRAVED IN OUTPUT) ===
You MUST provide a clear English camera motion instruction for AI Video (Runway/Kling) that matches the image perspective:
- For Emotional/Intimate ECU: "Slow subtle micro-movements, shallow depth of field shift"
- For Grand Wide Shots: "Slow cinematic drone push-in, parallax effect on background elements"
- For Action/Tension MS: "Dynamic handheld camera shake, fast tracking shot"
- For Map/Strategic Top-Down: "Slow rotation, smooth overhead glide"

CRITICAL RULE FOR PROFILES: If the script features a specific historical or real figure, explicitly write their name. If referring to the narrator, use the "Masked Investigator" description above.

Example 1 (Investigative - Wide Establishing): [Wide Establishing Shot (WS), Low Angle] of a mysterious investigative figure wearing a dark hoodie and a smooth, featureless white anonymous mask. One eye hole of the mask glows with a bright cosmic blue energy. The figure is standing in a dark, abandoned warehouse lit by a single flickering neon light. -- Style: cinematic dark thriller, high contrast lighting, mysterious hacker aesthetic, shadowy atmosphere, sharp focus, anamorphic lens flare --ar 16:9 --style raw --v 6.0 --no text, typography, letters, words, watermark, cartoon, bright daylight, flat colors, low quality
Example 2 (The Clue - Close Up): [Extreme Close-Up (ECU), Over-The-Shoulder] of a gloved hand holding a heavily redacted classified document under a harsh desk lamp in a dark room. -- Style: cinematic dark thriller, high contrast lighting, mysterious hacker aesthetic, shadowy atmosphere, sharp focus, anamorphic lens flare --ar 16:9 --style raw --v 6.0 --no text, typography, letters, words, watermark, cartoon, bright daylight, flat colors, low quality

=== OUTPUT PROTOCOL ===
Generate highly descriptive prompts for the visual engine.
1. "recommended_template": (e.g. "old_tv", "archival_book", "classified_folder", "hologram_projector", or "FULLSCREEN")
2. "first_frame_image_prompt": The precise english generative AI prompt for Shot 1, starting with [Shot Size, Camera Angle]. (CLEAN SHOT, NO HUMAN FACES UNLESS HISTORICAL FIGURE NAME).
3. "first_frame_motion_prompt": English motion prompt for Runway/Kling for Shot 1 matching the Shot Size.
4. "second_frame_image_prompt": The precise english generative AI prompt for Shot 2 (seamlessly follow shot 1 with a new angle), starting with [Shot Size, Camera Angle].
5. "second_frame_motion_prompt": English motion prompt for Runway/Kling for Shot 2 matching the Shot Size.
6. "multi_camera_angles": An array of 3 distinct directorial angles.
7. "b_roll_search_query": Stock video search query (Pexels).
8. "sfx": Arabic SFX description.

Output strict JSON:
{
  "recommended_template": "string",
  "first_frame_image_prompt": "string",
  "first_frame_motion_prompt": "string (ENGLISH ONLY, e.g. Slow zoom in, Cinematic fast tracking shot)",
  "second_frame_image_prompt": "string",
  "second_frame_motion_prompt": "string (ENGLISH ONLY, e.g. Slow pan right, Static shot, slow motion)",
  "multi_camera_angles": [
    { "type": "Wide Angle", "description": "Establishing shot of...", "lens": "24mm" },
    { "type": "Close-Up", "description": "Tight on the eyes...", "lens": "85mm macro" }
  ],
  "b_roll_search_query": "string (ENGLISH ONLY)",
  "sfx": "string",
  "transition_to_next_scene": "string (Match Cut, Hard Cut, Same Scene, New Location)"
}
`;

  const prompt = IdentityMiddleware.injectPersona(basePrompt, 'viz-001');

  return callWithRetry(async () => {
    const delayMs = engine === "ollama" ? 5000 : 2000;
    await new Promise(r => setTimeout(r, delayMs));
    const rawContent = await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        recommended_template: { type: Type.STRING },
        first_frame_image_prompt: { type: Type.STRING },
        first_frame_motion_prompt: { type: Type.STRING },
        second_frame_image_prompt: { type: Type.STRING },
        second_frame_motion_prompt: { type: Type.STRING },
        b_roll_search_query: { type: Type.STRING },
        sfx: { type: Type.STRING },
        transition_to_next_scene: { type: Type.STRING }
      },
      required: ["first_frame_image_prompt"]
    }, engine, onChunk, undefined, false, 0.5, true);
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
1. Maintain the 100% Egyptian Slang tone (العامية المصرية 100%).
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
2. Enforce the 100% Egyptian Arabic tone (العامية المصرية الصميمة). Remove any Modern Standard Arabic (Fusha) phrasing. Write it the way a real Egyptian content creator speaks.
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
  masterScript: string,
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
  const DNA = getChannelDNA('barwaz_classic');
  const basePrompt = `SYSTEM ROLE: You are a Senior Edutainment Copywriter and YouTube Strategist. Your writing style is strictly 'Clean Cairene Egyptian Slang' (عامية قاهرية بيضاء). No formal Arabic (Fusha) is allowed.
You are generating the final packaging metadata AND spin-off content (Shorts, Threads, Social Posts) from the Final Master Document/Script.

Video Title Idea: "${videoTitle}"
NARRATIVE MOOD: ${moodContext.scriptingStyle}

Final Text:
${masterScript.substring(0, 5000)} ... [Truncated]

CRITICAL RULES FOR OUTPUT:
1. TITLES (عناوين يوتيوب/فيسبوك): Must be click-magnets. Use paradoxes, shocking numbers, and curiosity gaps. NEVER use direct academic titles. Example: '٤ سنين قلبت التاريخ.. السر المرعب!' instead of 'عبقرية الحفظ'.
2. DESCRIPTION (الوصف): Write it as a fast-paced 'Teaser' that hooks the reader. Do not summarize the video. Sell the mystery. MANDATORY: Start with 3-4 catchy sentences in Egyptian Slang.
3. SHORTS HOOKS (الخطاف): NEVER start with clichés like 'عمرك سألت نفسك' or 'هل تعلم'. Start with a Pattern Interrupt, a bold claim, or a shocking scenario. Example: 'لو قلتلك إن في إنسان ذاكرته أقوى من هارد ديسك.. هتصدقني؟'.
4. TONE: Clean Cairene Egyptian Slang (عامية قاهرية بيضاء). Fast-paced, suspenseful Edutainment style. No Fusha!
5. Thumbnail Prompt: Midjourney AI prompt (in English) for an eye-catching illustration thumbnail.
   - GLOBAL THEME: MUST strictly embrace the official channel's aesthetic style: ${DNA.visual_rules.global_style}
   - ASPECT RATIO: MUST append --ar 16:9 to the positive prompt.
   - STRICT NEGATIVE RULES (MANDATORY): --no text, font, letters, watermark, geometric shapes, 3d render.
   - CRITICAL COMPOSITION SAFETY RULES: NEVER use words like 'Calligraphy', 'Letters', or 'Text' in the positive image prompt.
6. Chapters: 4-7 timestamps.
7. Tags: 10-15 highly relevant SEO keywords.
8. Twitter Thread: A 3-to-5 part thread summarizing the most mind-blowing fact.
9. Social Posts: 1 Facebook/LinkedIn, 1 Instagram post.
10. VERTICAL PROMPTS: Any prompts for Shorts/TikTok MUST use --ar 9:16 and follow the channel visual style.

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
                visual_instructions: { type: "STRING" },
                vertical_image_prompt: { type: "STRING", description: "Midjourney prompt with --ar 9:16" }
              },
              required: ["title", "hook", "body", "cta", "visual_instructions", "vertical_image_prompt"]
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

export async function executeAgent_TTSNormalizer(
  script: string,
  engine: string,
  persona: string,
  onChunk?: (text: string) => void,
  model?: string
): Promise<string> {
  const isFastPaced = persona !== "الهرم الرابع" && persona !== "برواز التاريخ";

  const prompt = `[Node: TTS Phonetic Normalizer / الفلترة الصوتية المتقدمة]
Task: Process the provided Arabic script strictly for Advanced Text-to-Speech (TTS) normalization.
DO NOT change the narrative, the tone, or the meaning. DO NOT add new sentences. DO NOT complain or output meta-text.

You must perform essential normalizations:
1. Number-to-Word Conversion: Convert ALL numerical digits into Arabic spoken words based on the context. 
   Examples: "سنة 1919" -> "سنة ألف وتسعمية وتسعطاشر" | "11.5" -> "حداشر ونص" | "3 قرون" -> "تلات قرون".
2. Acronym Phonetics: Convert any English letters/acronyms into Arabic phonetic spelling.
   Examples: "AI" -> "إيه آي" | "PDF" -> "بي دي إف" | "DNA" -> "دي إن إيه".
3. Smart Diacritics (التشكيل الذكي): Add Arabic diacritics (Tashkeel: Fatha, Damma, Kasra, Shadda) to complex or historical names, and crucial transitional words to ensure the TTS engine reads them correctly with the right phonetic weight.

${isFastPaced ? `4. Dynamic Prosody (أسلوب الدحيح/الإيقاع السريع):
   - Add punctuation cues to force the TTS to pause briefly or change rhythm.
   - Use text markers like dashes (--) for sudden shifts in tone, or ellipsis (...) for suspenseful pauses.
   - Use double spaces or commas where a real human presenter taking a quick breath would pause.
   - ENSURE the final output reads like an energetic, fast-paced presenter.` : ''}

Return ONLY the fully normalized script text. No pleasantries. No markdown code blocks. Just the raw text.

=== ORIGINAL SCRIPT ===
${script}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, model || 0.1);
    let cleanText = rawContent.trim();
    cleanText = cleanText.replace(/^```[^\n]*\n/g, '').replace(/\n```$/g, '');
    return cleanText.trim();
  });
}
