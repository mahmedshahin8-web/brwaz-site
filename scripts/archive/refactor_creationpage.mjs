import fs from 'fs';

let text = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

text = text.replace(/glass-panel/g, 'bg-black border border-white/20');
text = text.replace(/rounded-xl/g, 'rounded-sm');
text = text.replace(/rounded-2xl/g, 'rounded-sm');
text = text.replace(/rounded-lg/g, 'rounded-none');
text = text.replace(/shadow-2xl/g, 'shadow-[0_0_15px_rgba(255,255,255,0.05)]');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', text);
console.log('ContentCreationPage refactored');
