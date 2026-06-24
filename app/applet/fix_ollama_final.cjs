const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = 'if (isTimeout) {\\n                throw new Error("Local AI Server Timeout. المحرك استغرق وقتاً طويلاً جداً في الاستجابة (أكثر من 10 دقائق).");\\n            }\\n            throw new Error(`Local AI Server Unreachable. تعذر الاتصال بمحرك Ollama المحلي، تأكد من تشغيله. التفاصيل: ${e.message}`);';
const replacementStr = `if (getGeminiKeys().length > 0) {
                console.log("[MAESTRO] All Ollama retries exhausted. Falling back to Gemini...");
                engine = "gemini";
                return runWithRotation(prompt, instr, temp, schema, "gemini", undefined, undefined, stream, enableSearch);
            }
            if (isTimeout) {
                throw new Error("Local AI Server Timeout. المحرك استغرق وقتاً طويلاً جداً في الاستجابة (أكثر من 10 دقائق).");
            }
            throw new Error(\`Local AI Server Unreachable. تعذر الاتصال بمحرك Ollama المحلي، تأكد من تشغيله. التفاصيل: \${e.message}\`);`;

const pieces = code.split('if (isTimeout) {');

if (pieces.length >= 2) {
    // The last occurrence is where we want to insert.
    let pre = pieces.slice(0, pieces.length - 1).join('if (isTimeout) {');
    let post = 'if (isTimeout) {' + pieces[pieces.length - 1];
    
    const fallback = `if (getGeminiKeys().length > 0) {
                console.log("\\n[MAESTRO] All Ollama retries exhausted. Falling back to Gemini...\\n");
                return runWithRotation(prompt, instr, temp, schema, "gemini", undefined, undefined, stream, enableSearch);
            }
            `;
            
    code = pre + fallback + post;
    fs.writeFileSync('server.ts', code);
    console.log("SUCCESSFULLY PATCHED");
} else {
    console.log("NOT FOUND");
}
