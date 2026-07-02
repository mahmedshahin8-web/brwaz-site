const fs = require('fs');
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

content = content.replace(/#8b0000/g, 'var(--accent-danger, #ff4d4d)');
content = content.replace(/text-\[#8b0000\]/g, 'text-accent-danger');
content = content.replace(/bg-\[#8b0000\]/g, 'bg-accent-danger');
content = content.replace(/border-\[#8b0000\]/g, 'border-accent-danger');

content = content.replace(/text-\[#1a1a1a\]/g, 'text-white');
content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-bg-darker');
content = content.replace(/border-\[#1a1a1a\]/g, 'border-white/10');
content = content.replace(/#1a1a1a/g, 'rgba(255,255,255,0.1)'); 

content = content.replace(/text-\[#f4eee0\]/g, 'text-text-primary');
content = content.replace(/bg-\[#f4eee0\]/g, 'bg-black/20');
content = content.replace(/#f4eee0/g, 'rgba(0,0,0,0.2)'); 

content = content.replace(/\bnewspaper\b/g, "font-['JetBrains_Mono'] tracking-tight");

// shadow replacement for brutalist stuff
content = content.replace(/shadow-\[.*?\]/g, '');

content = content.replace(/bg-white/g, 'bg-bg-darker');
// keep border-white as border-white/10
content = content.replace(/border-white(?!(\/|\b))/g, 'border-white/10');
content = content.replace(/text-\[#333\]/g, 'text-text-muted');
content = content.replace(/text-gray-800/g, 'text-text-primary');

// Replace active/hover classes that used old colors
content = content.replace(/active:bg-\[#8b0000\]/g, 'active:bg-accent-danger');
content = content.replace(/active:bg-\[#1a1a1a\]/g, 'active:bg-white/10');
content = content.replace(/active:text-\[#1a1a1a\]/g, 'active:text-white');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log("UX Fixes Applied");
