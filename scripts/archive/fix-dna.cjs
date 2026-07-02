const fs = require('fs');
let code = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const t2 = `         },
        researchMap // Passes the Map -> instantly jumps to Phase 2 (Ramzy & Fox)
      );`;
       
const r2 = `         },
        researchMap ? { ...researchMap, visual_dna: visualDNA || researchMap.visual_dna } : null // Passes the Map -> instantly jumps to Phase 2 (Ramzy & Fox)
      );`;
       
const t3 = `         },
        passedMap // Passes the Map -> instantly jumps to Phase 2 (Ramzy & Fox)
      );`;
      
const r3 = `         },
        passedMap ? { ...passedMap, visual_dna: visualDNA || passedMap.visual_dna } : null // Passes the Map -> instantly jumps to Phase 2 (Ramzy & Fox)
      );`;

code = code.replace(t2, r2);
code = code.replace(t3, r3);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', code);
console.log('Fixed Visual DNA pass!');
