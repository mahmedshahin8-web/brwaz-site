import fs from "fs";
const file = "src/lib/gemini.ts";
let content = fs.readFileSync(file, 'utf8');

const badChunk = `   const safeDirectorScenes = directorScenes || [];
  for (let i = 0; i < safeDirectorScenes.length; i++) {
    const scene = safeDirectorScenes[i];
    
    onProgress?.(
      45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
      \`[!] المخرج الفني يحقن بصمته: المشهد \${i + 1} من أصل \${safeDirectorScenes.length}...\`
    );
    
    // We will run the Art Director agent sequentially
    try {
      const artResponse = await executeAgent3_ArtDirector(scene, mood, engineNode2, onChunk);
      const generatedScene = {
        ...scene,
        ...artResponse
      };
      
      const processedScene: EpisodeScene = {
        asset_id: generatedScene.scene_id || \`[Scene \${String(allScenes.length + 1).padStart(2, "0")}]\`,
        voice_over: generatedScene.voiceover_text,
        voiceover_notes: generatedScene.voiceover_notes,
        estimated_duration_seconds: generatedScene.estimated_duration_seconds,
        visual_cue: generatedScene.camera_and_vision,
        visual_motif: generatedScene.visual_motif,
        cinematic_movement: generatedScene.cinematic_movement,
        montage_instructions: generatedScene.montage_instructions,
        sound_design: generatedScene.sound_and_sfx,
        asmr_soundscape: generatedScene.asmr_soundscape,
        image_prompt_nano_banana: applyGlobalStyle(generatedScene.image_prompt_nano_banana || ""),
        ai_video_prompt: generatedScene.ai_video_prompt || "",
        b_roll_keywords: generatedScene.b_roll_keywords || "",
        loop_type: generatedScene.loop_type || null,
        loop_id: generatedScene.loop_id || null,
        visual_treatment: generatedScene.visual_treatment || "",
        stock_search_queries: generatedScene.stock_search_queries || [],
        narrative_strategy: strategy
      };
      
      allScenes.push(processedScene);
      if (onSceneReady) {
        onSceneReady(processedScene);
      }
      
      // Smart Delay between sequential scene requests to prevent 429 errors
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.warn("Art Director failed for a scene, returning original scene", err);
      // Construct a minimalist fallback scene so we don't break the flow
      const fallbackScene: EpisodeScene = {
        ...scene,
        asset_id: scene.scene_id || \`[Scene \${String(allScenes.length + 1).padStart(2, "0")}]\`,
        image_prompt_nano_banana: "",
        ai_video_prompt: "",
        b_roll_keywords: "",
        visual_treatment: "",
        narrative_strategy: strategy,
        stock_search_queries: []
      };
      allScenes.push(fallbackScene);
      if (onSceneReady) {
        onSceneReady(fallbackScene);
      }
    }
  }ipt must be breathtaking and deeper than popular YouTube channels. Do NOT just rattle off facts. You must build suspense, ask philosophical questions, and use profound intellectual framing.`;

const correctChunk = `      "scene_number": 1,
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

You are the "Scripting Node" (Node 2) of the Production Engine. Your task is to write the voiceover script and visual prompts for a batch of consecutive scenes based on the OSINT chapter structure.

RULES FOR WORLD-CLASS STORYTELLING (BEATING THE BEST):
1. **THE ALDAHEEH / DOCUMENTARY STANDARD**: Your script must be breathtaking and deeper than popular YouTube channels. Do NOT just rattle off facts. You must build suspense, ask philosophical questions, and use profound intellectual framing.`;

if (content.includes(badChunk)) {
  content = content.replace(badChunk, correctChunk);
  fs.writeFileSync(file, content);
  console.log("Restored successfully!");
} else {
  console.log("Bad chunk not found.");
}
