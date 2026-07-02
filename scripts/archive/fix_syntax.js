import fs from 'fs';

const content = fs.readFileSync('src/lib/gemini.ts', 'utf-8');
const fixedContent = content.replace(/coreAnchor \+ "\n\[/g, 'coreAnchor + "\\n[');
fs.writeFileSync('src/lib/gemini.ts', fixedContent);
console.log('Fixed syntax error in strings');
