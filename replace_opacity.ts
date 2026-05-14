import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/opacity-0 group-active:opacity-100/g, 'opacity-100');
content = content.replace(/opacity-0 group-active\/script:opacity-100/g, 'opacity-100');
content = content.replace(/opacity-0 group-active\/prompt:opacity-100/g, 'opacity-100');
fs.writeFileSync('src/App.tsx', content);
