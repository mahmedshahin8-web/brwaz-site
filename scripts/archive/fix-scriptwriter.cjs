const fs = require('fs');
let code = fs.readFileSync('src/lib/agents.ts', 'utf8');

const targetStr = `[PREVIOUS ROLLING CONTEXT (To continue flawlessly and avoid loops)]:
\${rollingContext ? rollingContext : "This is the very first chapter."}`;

const replacementStr = `[PREVIOUS ROLLING CONTEXT (To continue flawlessly and avoid loops)]:
\${rollingContext ? rollingContext : "This is the very first chapter."}

[ANTI-REPETITION QA WAKIL (وكيل المراجعة الصارم)]:
CRITICAL: You MUST NOT repeat any facts, stories, or jokes that were just mentioned in the rolling context above. Advance the plot forward continuously.`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/lib/agents.ts', code);
  console.log('Scriptwriter QA updated');
} else {
  console.log('Target not found in scriptwriter');
}
