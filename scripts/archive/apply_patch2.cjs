const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'return res.status(500).json({ error: `Ollama Stream Error: ${err}` });',
  'console.warn(`[STREAM] Ollama Stream Error, falling back to Gemini: ${err}`); req.body.engine = "gemini"; return pipeGeminiStream(req, res);'
);
code = code.replace(
  'console.error(`[MAESTRO] Fabric Proxy Attempt ${attempt + 1} failed:`, error.message);',
  'console.error(`[MAESTRO] Fabric Proxy Attempt ${attempt + 1} failed:`, error.message);\n            if (attempt === maxRetries) {\n                console.log("[MAESTRO] All Ollama retries exhausted. Falling back to Gemini...");\n                return runWithRotation(prompt, instr, temp, schema, "gemini", undefined, undefined, stream, enableSearch);\n            }'
);
fs.writeFileSync('server.ts', code);
