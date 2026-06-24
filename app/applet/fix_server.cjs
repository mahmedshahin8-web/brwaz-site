const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch 1: pipeOllamaStream fallback
const patch1Src = `        if (!response.ok) {
            const err = await response.text();
            return res.status(500).json({ error: \`Ollama Stream Error: \${err}\` });
        }`;

const patch1Dst = `        if (!response.ok) {
            const err = await response.text();
            console.warn(\`[STREAM] Ollama Stream Error, falling back to Gemini: \${err}\`);
            req.body.engine = "gemini";
            return pipeGeminiStream(req, res);
        }`;

code = code.replace(patch1Src, patch1Dst);

// Patch 2: runWithRotation fallback
const patch2Src = `            console.error(\`[MAESTRO] Fabric Proxy Attempt \${attempt + 1} failed:\`, error.message);`;

const patch2Dst = `            console.error(\`[MAESTRO] Fabric Proxy Attempt \${attempt + 1} failed:\`, error.message);
            if (attempt === maxRetries) {
                console.log("[MAESTRO] All Ollama retries exhausted. Falling back to Gemini...");
                return runWithRotation(prompt, instr, temp, schema, "gemini", undefined, undefined, stream, enableSearch);
            }`;

code = code.replace(patch2Src, patch2Dst);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
