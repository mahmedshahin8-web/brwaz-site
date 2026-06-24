const fs = require('fs');
let code = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

code = code.replace(/handleBrainstorming\(\);/g, 'handleSpinRadar();');
code = code.replace(/isBrainstorming/g, 'isGeneratingTitle');
code = code.replace(/generatedAngles/g, 'suggestedTitles');
code = code.replace(/setGeneratedAngles/g, 'setSuggestedTitles');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', code);
console.log("Fixed state variable names.");
