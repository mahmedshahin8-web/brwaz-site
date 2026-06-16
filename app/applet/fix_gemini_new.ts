import fs from 'fs';

let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const newEngine = `
const OLLAMA_API_NEW = "http://localhost:11434/api/chat";
const MODEL_NAME_NEW = "qwen"; // Ensure this matches your local model

// 1. Base Fetch Utility with Tuned Parameters (Anti-Looping)
async function fetchOllamaNew(messages: any[], systemPrompt: string) {
    const response = await fetch(OLLAMA_API_NEW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL_NAME_NEW,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            stream: false,
            options: {
                temperature: 0.65,
                repeat_penalty: 1.25,
                presence_penalty: 0.5,
                num_predict: 4096,
                stop: ["<|im_end|>", "المشهد التالي", "[نهاية المشهد]"]
            }
        })
    });
    
    if (!response.ok) throw new Error("Error 500: Local AI Server Unreachable");
    const data = await response.json();
    return data.message.content;
}

// 2. Red Team Reflection Loop (Self-Correction)
async function applyRedTeamReflection(draftScene: string) {
    const auditPrompt = "You are a Red Team Auditor. Review this scene for historical hallucinations and redundancies. Output a JSON with { 'findings': '...', 'revised_scene': '...' }. DO NOT hallucinate and DO NOT add conversational text.";
    
    const messages = [{ role: 'user', content: draftScene }];
    const auditResult = await fetchOllamaNew(messages, auditPrompt);
    
    try {
        return JSON.parse(auditResult).revised_scene;
    } catch (e) {
        return draftScene; // Fallback in case of JSON parse error
    }
}

// 3. Art Director Agent (Visual DNA & Ethnographic Accuracy)
async function executeNode3_Visuals(sceneText: string, timePeriod: string) {
    const artDirectorPrompt = "You are the Art Director. Analyze the scene and output an English image prompt. CRITICAL RULES: - Visual Style MUST be: authentic vintage Egyptian and Middle Eastern editorial illustration, dramatic chiaroscuro. - NEVER use meaningless floating circles, connecting lines, or abstract geometric shapes. - Match cultural context accurately (e.g., 7th-century specific robes, accurate features). Output JSON: { 'image_prompt': '...', 'transition_to_next_scene': '...' }";
    
    const messages = [{ role: 'user', content: "Scene: " + sceneText + " | Era: " + timePeriod }];
    const visuals = await fetchOllamaNew(messages, artDirectorPrompt);
    
    try {
        return JSON.parse(visuals);
    } catch (e) {
        return { image_prompt: "", transition_to_next_scene: "Hard Cut" };
    }
}

export async function generateEpisodeNew(topic: string, requestedMinutes: number, onProgress?: any, onSceneReady?: any): Promise<any> {
    const requiredScenes = Math.round(requestedMinutes * 2.5);
    let episodeData = { video_title: topic, mood: "تشريح الحكايات", thumbnail: { image_prompt: "", text_on_image: "" }, opening_sketch: { asset_id: "0", voice_over: "Welcome to " + topic, visual_cue: "", montage_instructions: "", sound_design: "" }, scenes: [] as any[], sources: [] as any[], publishing_kit: { youtube_titles: [], description: "", thumbnail_prompt: "", tags: [] }, shorts: [] as any[], audit_report: { status: "warning", executive_summary: "Not implemented", issues: [] } };
    
    let slidingContext = "Topic: " + topic + ". Total Scenes: " + requiredScenes + ".";

    for (let i = 1; i <= requiredScenes; i++) {
        if (onProgress) onProgress((i / requiredScenes) * 100, "Building scene " + i + " of " + requiredScenes + "...");
        
        const writerPrompt = "You are a Senior Scriptwriter writing in Sophisticated Egyptian Ammiya (Clean Cairene). Write Scene " + i + " of " + requiredScenes + ". Context so far: " + slidingContext + ". Keep it punchy, linear progression, NO repetition.";
        
        let draftScene = await fetchOllamaNew([{ role: 'user', content: "Write scene " + i }], writerPrompt);
        let cleanSceneText = await applyRedTeamReflection(draftScene);
        let visualData = await executeNode3_Visuals(cleanSceneText, "Determined dynamically by script");
        
        const finalScene = {
            asset_id: "scene_" + i,
            scene_number: i,
            voice_over: cleanSceneText,
            visual_cue: visualData.image_prompt,
            image_prompt: visualData.image_prompt,
            transition: visualData.transition_to_next_scene,
            montage_instructions: "",
            sound_design: ""
        };
        
        episodeData.scenes.push(finalScene);
        if (onSceneReady) onSceneReady(finalScene);
        slidingContext += "\\nScene " + i + " summary: " + cleanSceneText.substring(0, 100) + "...";
    }
    
    return episodeData;
}
`;

fs.appendFileSync('src/lib/gemini.ts', '\n' + newEngine);
console.log('Done!');
