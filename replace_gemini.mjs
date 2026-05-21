import fs from "fs";
const file = "src/lib/gemini.ts";
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  const BATCH_SIZE = 3;
  const safeDirectorScenes = directorScenes || [];
  for (let i = 0; i < safeDirectorScenes.length; i += BATCH_SIZE) {
    const batch = (safeDirectorScenes || []).slice(i, i + BATCH_SIZE);
    
    onProgress?.(
      45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
      \`[!] المخرج الفني يحقن بصمته: المشاهد من \${i + 1} إلى \${Math.min(i + BATCH_SIZE, safeDirectorScenes.length)} من أصل \${safeDirectorScenes.length}...\`
    );
    
    // We will run the Art Director agent for each scene in the batch in parallel
    const enhancedScenes = await Promise.all(batch.map(async (scene: any) => {
      try {
        const artResponse = await executeAgent3_ArtDirector(scene, mood, engineNode2, onChunk);
        return {
          ...scene,
          ...artResponse
        };
      } catch (err) {
        console.warn("Art Director failed for a scene, returning original scene", err);
        return scene;
      }
    }));

    for (const generatedScene of enhancedScenes) {
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
    }
  }`;

const replaceStr = `  const safeDirectorScenes = directorScenes || [];
  for (let i = 0; i < safeDirectorScenes.length; i++) {
    const scene = safeDirectorScenes[i];
    
    onProgress?.(
      45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
      \`[!] المخرج الفني يحقن بصمته: المشهد \${i + 1} من أصل \${safeDirectorScenes.length}...\`
    );
    
    // We will run the Art Director agent sequentially to avoid IP Blocks (429)
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
      
      // Delay to respect API constraints
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.warn("Art Director failed for a scene, returning original scene", err);
      // Fallback
      allScenes.push(scene);
      if (onSceneReady) {
        onSceneReady(scene);
      }
    }
  }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log("Successfully replaced in gemini.ts");
} else {
  console.log("Target string not found in gemini.ts.");
}
