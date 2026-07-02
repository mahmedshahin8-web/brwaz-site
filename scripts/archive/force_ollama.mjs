import { promises as fs } from 'fs';

async function updateFile() {
  const path = 'src/lib/gemini.ts';
  let text = await fs.readFile(path, 'utf8');

  // We want to force fetchUrl to "http://localhost:11434/api/chat" and model to "qwen2.5"
  const targetRegex = /const useOllama = localStorage\.getItem\("useOllama"\)[\s\S]*?const response = await fetch\(fetchUrl, /;
  
  const replacement = `const fetchUrl = "http://localhost:11434/api/chat";
    const requestBody: any = {
      model: "qwen2.5",
      messages: [
        { role: "system", content: engineSystemInstruction },
        { role: "user", content: prompt }
      ],
      stream: true,
      options: { 
        temperature: 0.8,
        repeat_penalty: 1.15,
        top_k: 40,
        top_p: 0.9,
        num_ctx: 32768, // Ensure enough context limit for long generations
        num_predict: -1 // Unlimited predicting
      }
    };
    if (schema) {
      requestBody.format = "json";
    }

    const response = await fetch(fetchUrl, `;

  text = text.replace(targetRegex, replacement);

  await fs.writeFile(path, text);
  console.log('Force Ollama applied.');
}

updateFile().catch(console.error);
