import fs from 'fs';

let text = fs.readFileSync('src/components/SceneCard.tsx', 'utf8');

// Replace glass-panel with terminal aesthetic
text = text.replace(/glass-panel/g, 'bg-black border border-white/20');
text = text.replace(/rounded-2xl/g, 'rounded-sm');
text = text.replace(/rounded-xl/g, 'rounded-none');
text = text.replace(/rounded-lg/g, 'rounded-none');

// Make the root div have the blueprint background
text = text.replace(/className=\{\`bg-black border border-white\/20 border border-white\/10 rounded-sm p-4 flex flex-col space-y-4 transition-all \$\{/g, `className={\`bg-black border border-white/20 p-4 flex flex-col space-y-4 transition-all \${`);

text = text.replace(/<div\n\s*className=\{\`bg-black border border-white\/20 border border-white\/10/g, `<div\n      style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 20 L20 0' fill='none' stroke='white' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")\` }}\n      className={\`bg-black border border-white/20 `);

fs.writeFileSync('src/components/SceneCard.tsx', text);
console.log('SceneCard refactored');
