import fs from 'fs';
let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');
content = content.replace(/engine = "qwen"/g, 'engine = "gemini"');
fs.writeFileSync('src/lib/gemini.ts', content);
