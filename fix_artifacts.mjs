import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Fix artifacts
content = content.replace(/border border-white\/5 border border-white\/5/g, 'border border-white/5');
content = content.replace(/uppercase \/\[0\.05\]/g, 'uppercase');
content = content.replace(/font-arabic font-black text-white tracking-tighter leading-none font-arabic/g, 'font-arabic font-black text-white tracking-tighter leading-none');
content = content.replace(/text-white\/20 font-arabic text-xl  tracking-wide/g, 'text-white/40 font-arabic text-sm tracking-wide');
content = content.replace(/hover:bg-\[#050505\]\/80 backdrop-blur-xl border border-white\/5/g, '');
content = content.replace(/text-5xl lg:text-9xl/g, 'text-4xl font-black');
content = content.replace(/border-r border-white\/5 shrink-0/g, 'border-r border-white/5 shrink-0');
content = content.replace(/bg-\[#050505\]\/80 backdrop-blur-xl border border-white\/5 text-right relative active:micro-glow transition-all group overflow-hidden/g, 'p-8 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-sm relative overflow-hidden group transition-none cursor-pointer text-right');
content = content.replace(/<motion\.button(.*?)whileTap={{ scale: 0.98, backgroundColor: "rgba\(255,255,255,0\.05\)" }}/g, '<motion.button$1whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log('Artifacts fixed!');
