import fs from 'fs';

let text = fs.readFileSync('src/lib/gemini.ts', 'utf8');

// I will just replace the entire block from `try {` until `const response = await fetch(fetchUrl, {`
const blockToReplaceRegex = /try \{\s*const useOllama[\s\S]*?const response = await fetch\(fetchUrl, \{/g;

const targetRepl = `  try {
    const fetchUrl = "http://localhost:11434/api/chat";
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
        num_ctx: 32768,
        num_predict: -1
      }
    };
    if (schema) {
      requestBody.format = "json";
    }

    const response = await fetch(fetchUrl, {`;

if (text.match(blockToReplaceRegex)) {
   text = text.replace(blockToReplaceRegex, targetRepl);
   fs.writeFileSync('src/lib/gemini.ts', text);
   console.log('REPLACEMENT SUCCESS');
} else {
   console.log('REGEX DID NOT MATCH');
}
