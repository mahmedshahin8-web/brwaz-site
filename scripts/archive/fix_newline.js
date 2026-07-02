import fs from 'fs';
const content = fs.readFileSync('src/lib/gemini.ts', 'utf-8');
const fixedContent = content.split('\\n').join('\n');
fs.writeFileSync('src/lib/gemini.ts', fixedContent);
console.log('Fixed newlines');
