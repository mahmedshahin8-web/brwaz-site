import { promises as fs } from 'fs';

async function updateFile() {
  const path = 'src/services/radarAPI.ts';
  let text = await fs.readFile(path, 'utf8');

  text = text.replace(
      'import { generateContent } from "../lib/gemini"; // Temporary fallback', 
      'import { generateAIContentRaw } from "../lib/gemini"; // Temporary fallback'
  );
  
  text = text.replace(
      'const responseText = await generateContent(prompt, 0.5);',
      'const responseText = await generateAIContentRaw(prompt, undefined, "gemini");'
  );
  
  text = text.replace(
      'const responseText = await generateContent(prompt, 0.2);',
      'const responseText = await generateAIContentRaw(prompt, undefined, "gemini");'
  );

  await fs.writeFile(path, text);
  console.log('Fixed radarAPI.ts');
}

updateFile().catch(console.error);
