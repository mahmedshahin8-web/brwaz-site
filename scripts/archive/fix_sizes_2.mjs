import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const replacements = [
  { from: 'lg:text-4xl', to: 'lg:text-4xl' }, // just a check
  { from: 'text-4xl lg:text-4xl', to: 'text-3xl lg:text-5xl' },
  { from: 'text-5xl font-arabic font-black', to: 'text-4xl font-arabic font-black' },
  { from: 'p-12 bg-[#050505]/60', to: 'p-8 bg-[#050505]/60' },
  { from: 'text-3xl font-arabic text-white/90', to: 'text-xl font-arabic text-white/90' },
  { from: 'p-10 bg-[#050505]', to: 'p-6 bg-[#050505]' },
  { from: 'space-y-20', to: 'space-y-12' },
  { from: 'space-y-10', to: 'space-y-6' },
  { from: 'text-5xl font-mono font-black text-white tracking-widest opacity-20', to: 'text-3xl font-mono font-black text-white tracking-widest opacity-20' },
  { from: 'p-10 lg:p-12', to: 'p-8 lg:p-10' },
  { from: 'text-4xl font-arabic font-black text-white tracking-tighter mb-4', to: 'text-2xl font-arabic font-black text-white tracking-tighter mb-4' },
  { from: 'p-10 transition-none', to: 'p-6 transition-none' },
  { from: 'h-40', to: 'h-32' },
  { from: 'py-8 text-3xl lg:text-5xl', to: 'py-6 text-2xl lg:text-4xl' }
];

replacements.forEach(r => {
  content = content.split(r.from).join(r.to);
});

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log("Sizes reduced even more");
