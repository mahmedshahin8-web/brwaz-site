const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const markerStart = 'export function getSystemPrompt(): string {';
const markerEnd = 'function cleanUrl(url: string): string {';

const index1 = code.indexOf(markerStart);
const index2 = code.indexOf(markerEnd, index1);

const replacement = `export function getSystemPrompt(): string {
  const currentDNA = getChannelDNA("barwaz_classic");
  return buildSystemPrompt(currentDNA);
}

const GLOBAL_IMAGE_STYLE = "Cinematic lighting, 8k resolution, highly detailed, masterpieces style, hyper-realistic textures, ultra photorealistic";
const GLOBAL_NEGATIVE_PROMPT = "no people, no humans, no faces, no characters, no text, no letters, no typography, no Arabic, no words, no clones, no duplicates, low quality, blurry, distorted";

export function applyGlobalStyle(prompt: string): string {
  if (!prompt || prompt.trim() === "") return prompt;

  let finalPrompt = prompt;
  // Ensure we don't duplicate global styling
  if (!finalPrompt.includes(GLOBAL_IMAGE_STYLE)) {
    finalPrompt = \`\${finalPrompt}, \${GLOBAL_IMAGE_STYLE}\`;
  }
  if (!finalPrompt.includes(GLOBAL_NEGATIVE_PROMPT)) {
    finalPrompt = \`\${finalPrompt} --no \${GLOBAL_NEGATIVE_PROMPT}\`;
  }
  if (!finalPrompt.includes("--ar 16:9")) {
    finalPrompt = \`\${finalPrompt} --ar 16:9\`;
  }

  return finalPrompt;
}

`;

if (index1 !== -1 && index2 !== -1) {
  code = code.substring(0, index1) + replacement + code.substring(index2);
  fs.writeFileSync('src/lib/gemini.ts', code);
  console.log("Fixed globally!");
} else {
  console.log("Not found", index1, index2);
}
