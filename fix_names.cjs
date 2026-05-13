const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');
code = code.replace(/getChannelSystemPrompt\(\)/g, "getSystemPrompt()");
fs.writeFileSync('src/lib/gemini.ts', code);
console.log("Fixed!");
