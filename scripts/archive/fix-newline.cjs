const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

// find the exact index of `export function applyGlobalStyle`
const index = code.indexOf('export function applyGlobalStyle');
if (index !== -1) {
    // go back a few characters and fix the string manually
    const before = code.substring(0, index - 10);
    const after = code.substring(index);
    
    // find the end of the previous function
    const lastBrace = before.lastIndexOf('}');
    if (lastBrace !== -1) {
        code = before.substring(0, lastBrace + 1) + '\\n\\n' + after;
        fs.writeFileSync('src/lib/gemini.ts', code);
        console.log("Fixed via index");
    }
}
