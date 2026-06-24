const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /   if \(isTimeout\) \{[^^}+\}[^^]+throw new Error\(\`Local AI Server Unreachable[^^]+\`\);/m,
  '   console.log(\"[MAESTRO] All Ollama retries exhausted. Falling back to Gemini...\");\n            return runWithRotation(prompt, instr, temp, schema, \"gemini\", undefined, undefined, stream, enableSearch);'
);
fs.writeFileSync('server.ts', code);
