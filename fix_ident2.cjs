const fs = require('fs');

let c = fs.readFileSync('src/lib/gemini.ts', 'utf8');

c = c.replace(/return coreAnchor \+ "\n/g, 'return coreAnchor + "\\n');

fs.writeFileSync('src/lib/gemini.ts', c);
console.log('Fixed newline bug');
