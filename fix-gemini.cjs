const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const target = `export async function generateDiverseTopics(mood: string, engine: string, onProgress?: any, signal?: AbortSignal, model?: string): Promise<{title: string, description: string}[]> {
  try {
    const ai = getAiInstance();
    const prompt = \`
You are an expert creative director and trend analyst. The user requested 10 highly engaging and viral topic ideas for a YouTube video. 
The mood/style of the channel is: "\${mood}". 
Generate exactly 10 diverse, unique, and deeply fascinating topics that fit this style perfectly.
Do not provide generic ideas. Provide specific, compelling topics that make people click immediately.
Format your response as a JSON array of objects, where each object has:
- "title": A catchy topic title in Arabic.
- "description": A 1-2 sentence description explaining the core hook of this topic.

Return ONLY the JSON array.
\`;

    const res = await callGemini(ai, prompt, "system", signal);
    const jsonStr = res.substring(res.indexOf('['), res.lastIndexOf(']') + 1).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to generate diverse topics:", err);
    return [];
  }
}`;

const replacement = `export async function generateDiverseTopics(mood: string, engine: string, onProgress?: any, signal?: AbortSignal, model?: string): Promise<{title: string, description: string}[]> {
  try {
    const prompt = \`[Agent: Trend & Format Director]
You are an expert creative director and trend analyst. The user requested 10 highly engaging and viral topic ideas for a YouTube video. 
The mood/style of the channel is: "\${mood}". 
Generate exactly 10 diverse, unique, and deeply fascinating topics that fit this style perfectly.
Do not provide generic ideas. Provide specific, compelling topics that make people click immediately.
Format your response as a JSON array of objects, where each object has:
- "title": A catchy topic title in Arabic.
- "description": A 1-2 sentence description explaining the core hook of this topic.

Return ONLY the JSON array.\`;

    const res = await generateAIContentRaw(prompt, { engine, signal, model_name: model });
    const jsonStr = res.substring(res.indexOf('['), res.lastIndexOf(']') + 1).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to generate diverse topics:", err);
    return [];
  }
}`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/lib/gemini.ts', code);
  console.log("Fixed gemini.ts generateDiverseTopics");
} else {
  console.log("Target not found!");
}
