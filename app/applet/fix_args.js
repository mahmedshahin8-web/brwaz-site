const fs = require('fs');
let code = fs.readFileSync('./src/pages/ContentCreationPage.tsx', 'utf8');

const oldCallStart = 'const result = await generateEpisodeNew(';
const startIdx = code.indexOf(oldCallStart);
if (startIdx !== -1) {
    const endIdx = code.indexOf(');', startIdx);
    
    const newCall = `const result = await generateEpisodeNew(
            selectedTitle,
            duration,
            (p, s) => {
              targetProgress = Math.max(targetProgress, p);
              setStatus(s);
            },
            (scene) => {
              setData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  scenes: [...(prev.scenes || []), scene],
                };
              });
            }
          )`;
          
    code = code.substring(0, startIdx) + newCall + code.substring(endIdx + 2);
    fs.writeFileSync('./src/pages/ContentCreationPage.tsx', code);
    console.log('Replaced function call successfully!');
} else {
    console.log('Could not find generateEpisodeNew call');
}
