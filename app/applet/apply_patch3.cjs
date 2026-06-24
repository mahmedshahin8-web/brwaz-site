const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const s1 = 'if (isTimeout) {\\n                throw new Error("Local AI Server Timeout. المحرك استغرق وقتاً طويلاً جداً في الاستجابة (أكثر من 10 دقائق).");\\n            }\\n            throw new Error(\`Local AI Server Unreachable. تعذر الاتصال بمحرك Ollama المحلي، تأكد من تشغيله. التفاصيل: ${e.message}\`);';

const s2 = 'if (isTimeout) {\n                throw new Error("Local AI Server Timeout. المحرك استغرق وقتاً طويلاً جداً في الاستجابة (أكثر من 10 دقائق).");\n            }\n            throw new Error(`Local AI Server Unreachable. تعذر الاتصال بمحرك Ollama المحلي، تأكد من تشغيله. التفاصيل: ${e.message}`);';

let index = code.indexOf('throw new Error(`Local AI Server Unreachable');
if (index > -1) {
    const s = 'if (isTimeout) {';
    index = code.lastIndexOf(s, index);
    const replacement = `if (getGeminiKeys().length > 0) { console.log("[MAESTRO] Ollama exhausted. Falling back to Gemini..."); return runWithRotation(prompt, instr, temp, schema, "gemini", undefined, undefined, stream, enableSearch); }\n            `;
    code = code.substring(0, index) + replacement + code.substring(index);
    fs.writeFileSync('server.ts', code);
    console.log("Patch 3 successful");
} else {
    console.log("Not found");
}
