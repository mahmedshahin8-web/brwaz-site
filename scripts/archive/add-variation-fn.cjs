const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const ttsFn = `export async function generateSceneVariations(
  scene: any, 
  engine: string,
  model?: string
): Promise<any[]> {
  const prompt = \`[Agent: Art Director - Variations Mode]
You are a creative Art Director. Generate 3 distinct, high-quality visual/directorial variations for the following scene.
DO NOT change the voice_over or clean_tts. ONLY change the visual_cue, image_prompt, b_roll_search_query, and sound_design.

Original Scene:
\${JSON.stringify(scene, null, 2)}

Return a JSON array exactly containing 3 objects with keys: "visual_cue", "image_prompt", "b_roll_search_query", "sound_design".
NO MARKDOWN, NO OTHER TEXT.\`;

  const res = await generateAIContentRaw(prompt, undefined, engine, undefined, undefined, true, model);
  try {
    const jsonStr = res.substring(res.indexOf('['), res.lastIndexOf(']') + 1).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Variation parsing failed", err, res);
    return [];
  }
}
`;

if (!code.includes('generateSceneVariations')) {
  code += '\\n' + ttsFn;
  fs.writeFileSync('src/lib/gemini.ts', code);
  console.log('Added generateSceneVariations!');
}
