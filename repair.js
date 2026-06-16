import fs from 'fs';

const content = fs.readFileSync('src/lib/gemini.ts', 'utf-8');
const lines = content.split('\n');

// We need to delete lines 1392 to 1470 inclusive.
// Wait, we need to replace the section starting at:
//       "first_frame_motion_prompt": "string (English motion prompt for Shot 1- Verified Facts: ${dossier.verified_facts?.join(" | ") || "None"}
// down to
// NO CLICHES like "وفي النهاية". Start immediately with the philosophical punch.

let startIdx = lines.findIndex(l => l.includes('first_frame_motion_prompt": "string (English motion prompt for Shot 1- Verified Facts:'));
let endIdx = lines.findIndex(l => l.includes('NO CLICHES like "وفي النهاية". Start immediately with the philosophical punch.'));

if (startIdx !== -1 && endIdx !== -1) {
  const correctNode1AndNode2 = `      "first_frame_motion_prompt": "string (English motion prompt for Shot 1 - Duration 10 seconds. e.g., '10s, camera gently tracking')",
      "second_frame_image_prompt": "string (English image prompt for Shot 2 - seamless follow up to shot 1. Must include --ar 16:9 at the end)",
      "second_frame_motion_prompt": "string (English motion for Shot 2 - Duration 10 seconds)",
      "b_roll_search_query": "string (Precise English keywords to search on Pexels for a matching video/image. Be extremely specific, e.g., 'vintage typewriter working close up')",
      "sfx": "string (Arabic description of required sound effects, e.g., 'صوت رياح قوية')"
    }
  ]
}\`;

    const sceneText = await callWithRetry(async () => {
      return await generateAIContentRaw(
        scenePrompt,
        {
          type: Type.OBJECT,
          properties: {
             scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    voice_over: { type: Type.STRING },
                    visual_cue: { type: Type.STRING },
                    first_frame_image_prompt: { type: Type.STRING },
                    first_frame_motion_prompt: { type: Type.STRING },
                    second_frame_image_prompt: { type: Type.STRING },
                    second_frame_motion_prompt: { type: Type.STRING },
                    b_roll_search_query: { type: Type.STRING },
                    sfx: { type: Type.STRING },
                  },
                  required: ["voice_over", "visual_cue", "first_frame_image_prompt", "first_frame_motion_prompt", "second_frame_image_prompt", "second_frame_motion_prompt", "b_roll_search_query", "sfx"]
                }
             }
          },
          required: ["scenes"]
        },
        engine,
        onChunk,
        signal,
        false, // useGrounding
        0.6 // temperature (lower down for factualness and fewer hallucinations)
      );
    }, 3, 2000, signal);

    const parsedScene = safeJsonParse(sceneText, { scenes: [] });
    if (parsedScene && Array.isArray(parsedScene.scenes)) {
      for (const s of parsedScene.scenes) {
         s.asset_id = \`Scene_\${String(sceneIndex).padStart(2, '0')}_\${Math.random().toString(36).substring(2, 7)}\`;
         allScenes.push(s);
         sceneIndex++;
         // Add to running context to prevent looping
         runningContext += s.voice_over + "\\n";
         // Keep only the last 3000 characters to prevent confusing local models but keep enough context
         if (runningContext.length > 3000) {
            runningContext = "...\\n" + runningContext.slice(-3000);
         }
      }
    }
  }

  // ISOLATED CLIMAX NODE (if this is the last chapter)
  if (isLast) {
    if (onChunk) onChunk("[!] توليد الخاتمة الفلسفية (Climax Node)...");
    const climaxPrompt = \`[Climax & Synthesis Node]
\${getSystemPrompt()}

You are the final node of the script. The entire narrative has been built. 
Now, you must deliver a "Guillotine Ending". A profound, philosophical, or chilling conclusion that ties everything together and leaves the audience stunned.
NO CLICHES like "وفي النهاية". Start immediately with the philosophical punch.\n`;

  lines.splice(startIdx, endIdx - startIdx + 1, correctNode1AndNode2);
  fs.writeFileSync('src/lib/gemini.ts', lines.join('\\n'));
  console.log("Successfully repaired the first corruption.");
} else {
  console.log("Could not find start or end index for first corruption", startIdx, endIdx);
}

// Now replace from:
// - Verified Facts: \${dossier.verified_facts?.jo    const prompt = \`[Agent: Pacing Editor (مقص المونتير النصّي)]
// Down to:
// Return ONLY the final script with these tags naturally injected. Do NOT cut or repeat the text.\`;rompts for a batch of consecutive scenes based on the OSINT chapter structure.

startIdx = lines.findIndex(l => l.includes('- Verified Facts: ${dossier.verified_facts?.jo    const prompt'));
endIdx = lines.findIndex(l => l.includes('Return ONLY the final script with these tags naturally injected. Do NOT cut or repeat the text.`;rompts'));

if (startIdx !== -1 && endIdx !== -1) {
  const correctNode1EndNode2Start = `- Verified Facts: \${dossier.verified_facts?.join(" | ") || "None"}

JSON SCHEMA:
{
  "episode_theme": "الفكرة الرئيسية",
  "scenes_outline": [
    {
      "scene_number": 1,
      "core_fact": "المعلومة الحقيقية الموثقة التي يعتمد عليها المشهد بالتفصيل",
      "visual_concept": "وصف بصري يلتزم بقاعدة (Identity Guard) وبالألوان المحددة وبدون نصوص"
    }
  ] // MUST CONTAIN EXACTLY \${targetScenes} ITEMS
}


Topic: \${topic}
\`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          episode_theme: { type: Type.STRING },
          scenes_outline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_number: { type: Type.NUMBER },
                core_fact: { type: Type.STRING },
                visual_concept: { type: Type.STRING },
              },
              required: ["scene_number", "core_fact", "visual_concept"],
            },
          },
        },
        required: ["episode_theme", "scenes_outline"],
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    try {
      const validatedData = Node1Schema.parse(parsedData);
      await saveCachedStructure(topic, mood, validatedData);
      return validatedData;
    } catch (e) {
      console.error("Zod Validation Error:", e);
      throw new Error("Validation Failed on Node 1 output");
    }
  });
}

export const Node2BatchSchema = z.object({
  scenes: z.array(Node2Schema)
});

export async function executeNode2_Batch(
  scenes: Node1Structure["scenes_outline"],
  topic: string,
  mood: MoodType,
  persona: PersonaType,
  previousScript: string,
  researchData: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<z.infer<typeof Node2Schema>[]> {
  const moodContext = getMoodContext(mood);
  const personaContext = getPersonaInstructions(persona);
  
  const prompt = \`[Node 2: Master Scriptwriter & Director - The Storytelling Genius]
\${getSystemPrompt()}

You are the "Scripting Node" (Node 2) of the Production Engine. Your task is to write the voiceover script and visual prompts for a batch of consecutive scenes based on the OSINT chapter structure.`;

  lines.splice(startIdx, endIdx - startIdx + 1, correctNode1EndNode2Start);
  fs.writeFileSync('src/lib/gemini.ts', lines.join('\\n'));
  console.log("Successfully repaired the second corruption.");
} else {
  console.log("Could not find start or end index for second corruption", startIdx, endIdx);
}
