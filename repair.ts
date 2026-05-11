import fs from 'fs';

const path = 'src/lib/gemini.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `    // Create a summarized context of the last chapter to feed into the next
    const lastChapterScript = scenes.map((s) => s.voice_over).join(" ");
    previousSummary = \`In the previous chapter (\${chapter.chapter_title}), the script ended with: "\${lastChapterScript.substring(Math.max(0, lastChapterScript.length - 200))}"\`;

    if (i < chapters.length - 1) {
      onProgress?.(
        30 + Math.floor((40 * (i + 1)) / chapters.length),
        \`Waiting for 4 seconds to prevent API Rate Limits...\`,
      );
      await sleep(4000);
    }
  }

  onProgress?.(80, "المرحلة الأخيرة: جاري التجهيز...");
  const packaging = await generatePackaging(
    design.video_title,
    design.research_data,
    allScenes,
    engine,
    onChunk,
  );

  const processedScenes = allScenes.map((s, idx) => ({
    ...s,
    asset_id: \`[Scene \${String(idx + 1).padStart(2, "0")}]\`,
    image_prompt_nano_banana: applyGlobalStyle(
      s.image_prompt_nano_banana || "",
    ),
  }));
  const processedShorts = (packaging.shorts || []).map((s: any) => ({
    ...s,
    visual_instructions: applyGlobalStyle(s.visual_instructions || ""),
  }));

  return {
    video_title: design.video_title,
    thumbnail: design.thumbnail
      ? {
          ...design.thumbnail,
          image_prompt: applyGlobalStyle(design.thumbnail.image_prompt),
        }
      : undefined,
    opening_sketch: processedScenes[0] || {
      asset_id: "",
      voice_over: "",
      visual_cue: "",
      montage_instructions: "",
      sound_design: "",
      image_prompt_nano_banana: "",
      ai_video_prompt: "",
    },
    scenes: processedScenes.slice(1),
    sources: design.sources || [],
    publishing_kit: packaging.packaging,
    shorts: processedShorts,
  };
}

import {
  getCachedDossier,
  saveCachedDossier,
  getCachedStructure,
  saveCachedStructure
} from "./cache";

export async function executeNode0_OSINT(
  topic: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<OsintDossier> {
  const cached = await getCachedDossier(topic);
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded OSINT Dossier from local storage.");
    return cached;
  }

  const prompt = \`You are the "OSINT & RAG Engine" (Node 0) of the Nabash Production Engine. Your ONLY job is to perform a deep mock-investigation on the provided topic and output a strictly verified 'Dossier' in JSON format.

RULES:
1. DEPTH: Find the core conflict, mystery, or controversial elements.
2. HIDDEN PATTERNS: Read between the lines. Identify contradictions or secrets not commonly known.
3. VISUAL ANCHORS: Provide vivid, real-world historical or contextual visual details (e.g., "1940s Fedora", "Brutalist architecture").
4. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below. No markdown, no preambles.

JSON SCHEMA:
{
  "id": "hash_or_slug",
  "topic": "\${topic}",
  "created_at": "ISO date string",
  "last_updated": "ISO date string",
  "executive_summary": "Comprehensive overview",
  "timeline": [{"date_or_period": "...", "event_description": "...", "impact": "..."}],
  "key_entities": [{"name": "...", "role_or_type": "Person" | "Organization" | "Location" | "Concept" | "Other", "description": "...", "key_connections": ["..."]}],
  "core_conflict_or_mystery": "The dramatic core",
  "verified_facts": ["fact 1", "fact 2"],
  "hidden_patterns_or_contradictions": ["pattern 1", "contradiction 2"],
  "historical_visual_anchors": ["visual 1", "visual 2"],
  "sources": [{"title": "...", "url": "...", "credibility_score": 9, "key_takeaway": "..."}],
  "compiled_research_context": "A compressed string summarizing all the above for the next LLM node"
}

Topic to Investigate: \${topic}
\`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            created_at: { type: Type.STRING },
            last_updated: { type: Type.STRING },
            executive_summary: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date_or_period: { type: Type.STRING },
                  event_description: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["date_or_period", "event_description", "impact"]
              }
            },
            key_entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role_or_type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  key_connections: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "role_or_type", "description"]
              }
            },
            core_conflict_or_mystery: { type: Type.STRING },
            verified_facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            hidden_patterns_or_contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            historical_visual_anchors: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  credibility_score: { type: Type.NUMBER },
                  key_takeaway: { type: Type.STRING }
                },
                required: ["title", "url", "key_takeaway"]
              }
            },
            compiled_research_context: { type: Type.STRING }
        },
        required: ["id", "topic", "created_at", "last_updated", "executive_summary", "timeline", "key_entities", "core_conflict_or_mystery", "verified_facts", "hidden_patterns_or_contradictions", "historical_visual_anchors", "sources", "compiled_research_context"]
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    const dossierResult = parsedData as OsintDossier;
    await saveCachedDossier(topic, dossierResult);
    return dossierResult;
  });
}

export async function executeNode1_Structure(
  topic: string,
  dossier: OsintDossier,
  targetDurationMinutes: number,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<Node1Structure> {
  const cached = await getCachedStructure(topic);
  if (cached && (Date.now() % 2 !== 0)) { // Just bypass caching for now
  }
  
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded Architect Structure from local storage.");
    return cached;
  }
  
  const totalWords = targetDurationMinutes * 140;
  const minScenes = Math.max(Math.ceil(targetDurationMinutes / 1.25), targetDurationMinutes > 15 ? 30 : Math.round(targetDurationMinutes * 2));
  
  let dynamicBranchingRule = "";
  if (targetDurationMinutes > 15) {
    dynamicBranchingRule = \`\\nDYNAMIC BRANCHING (LONG-FORM): This is a long episode (\${targetDurationMinutes} minutes). Do NOT just stretch out the core scenes or rely on fluff.\\nInstead, expand the topic horizontally:\\n- Introduce new, deep sub-topics related to the core theme (e.g., historical roots, economic effects, geopolitical relationships, fictional/hypothetical interview angles).\\n- Build the outline with logical, ascending transitions where each new block opens a whole new dimension of the topic.\`;
  }

  const prompt = \`You are the "Architect Node" (Node 1) of the Nabash Production Engine. Your ONLY job is to take an OSINT Dossier and output a strict JSON outline for a narrative video episode.

RULES:
1. SCENE COUNT AND PACING: 
   - Target duration is \${targetDurationMinutes} minutes.
   - Target Word Count: Approximately \${totalWords} words total for the episode's voiceover.
   - Scene Constraint: Each scene must represent 1 to 1.5 minutes max (around 150-200 words).
   - Therefore, you MUST generate NO LESS THAN \${minScenes} independent but sequentially connected scenes.
2. NARRATIVE ARC: Each scene must push the story forward with documented facts. No inventing facts. No endless loops.\${dynamicBranchingRule}
3. ANTI-CLICHÉ: The narrative format must be smart, sober, and read between the lines.
4. IDENTITY GUARD: Visual concepts must NEVER describe human faces or embody people directly. Use physical metaphors (hands, shadows, tools, objects, wide angles).
5. VISUAL TEXT LOCK: No texts or watermarks overlaying the visual concept descriptions.
6. COLOR PALETTE: You MUST incorporate these colors in every visual concept: (Deep Navy #1F2A44, Warm Ivory #F5F1E8, Muted Gold #B89B6A).
7. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below.

DOSSIER DATA:
- Core Conflict: \${dossier.core_conflict_or_mystery}
- Hidden Patterns/Contradictions: \${dossier.hidden_patterns_or_contradictions?.join(" | ") || "None"}
- Verified Facts: \${dossier.verified_facts?.join(" | ") || "None"}

JSON SCHEMA:
{
  "episode_theme": "الفكرة الرئيسية",
  "scenes_outline": [
    {
      "scene_number": 1,
      "core_fact": "المعلومة الحقيقية الموثقة التي يعتمد عليها المشهد بالتفصيل",
      "visual_concept": "وصف بصري يلتزم بقاعدة (Identity Guard) وبالألوان المحددة وبدون نصوص"
    }
  ]
}

Topic: \${topic}
\`;`;

const startIndex = content.indexOf(`    // Create a summarized context of the last chapter to feed into the next
    const lastChapterScript = scenes.map((s) => s.voice_over).join(" ");`);

const endPattern = `Topic: \${topic}
\`;`;
const endIndex = content.lastIndexOf(endPattern) + endPattern.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("NOT FOUND");
    process.exit(1);
}

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content);
console.log("FIXED!");
