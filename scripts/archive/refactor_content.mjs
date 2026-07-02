import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Colors
content = content.replace(/bg-midnight/g, 'bg-[#050505]');
content = content.replace(/text-muted-amber\/(\d+)/g, 'text-[#f0c722]/$1');
content = content.replace(/text-muted-amber/g, 'text-[#f0c722]');
content = content.replace(/bg-muted-amber\/(\d+)/g, 'bg-[#f0c722]/$1');
content = content.replace(/bg-muted-amber/g, 'bg-[#f0c722]');
content = content.replace(/border-muted-amber\/(\d+)/g, 'border-[#f0c722]/$1');
content = content.replace(/border-muted-amber/g, 'border-[#f0c722]');
content = content.replace(/decoration-muted-amber\/(\d+)/g, 'decoration-[#f0c722]/$1');
content = content.replace(/decoration-muted-amber/g, 'decoration-[#f0c722]');
content = content.replace(/shadow-\[0_0_[^\]]+rgba\(212,175,55,0\.[0-9]+\)\]/g, 'shadow-[0_0_15px_rgba(240,199,34,0.4)]');
content = content.replace(/accent-danger/g, '#eb2630');
content = content.replace(/bg-accent-danger/g, 'bg-[#eb2630]');
content = content.replace(/text-accent-danger/g, 'text-[#eb2630]');
content = content.replace(/accent-warning/g, '#f0c722');
content = content.replace(/fill-accent-warning/g, 'fill-[#f0c722]');
content = content.replace(/stroke-accent-warning/g, 'stroke-[#f0c722]');
content = content.replace(/text-accent-warning/g, 'text-[#f0c722]');

// Typography
content = content.replace(/font-serif/g, 'font-arabic');
content = content.replace(/italic/g, ''); 
content = content.replace(/مكتب الاستخبارات \/\/ مصنع_v4\.2/g, 'معمل_السرد // V_4.5.X');

// UI Elements & Corners
content = content.replace(/rounded-xl/g, 'rounded-sm');
content = content.replace(/rounded-2xl/g, 'rounded-sm');
content = content.replace(/rounded-lg/g, 'rounded-sm');
content = content.replace(/rounded-full/g, 'rounded-sm');

// Elite Layout Details (Backdrop, Border changes)
content = content.replace(/bg-black\/40/g, 'bg-[#050505]/60 backdrop-blur-xl');
content = content.replace(/border-white\/\[0\.08\]/g, 'border-white/5');
content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-[#050505]/60 backdrop-blur-xl border border-white/5');
content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-[#050505]/80 backdrop-blur-xl border border-white/5');
content = content.replace(/group-hover:bg-white\/\[0\.02\]/g, '');
content = content.replace(/hover:bg-white/g, '');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log('Styles modified successfully!');
