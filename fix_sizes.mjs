import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const replacements = [
  { from: 'lg:text-9xl', to: 'lg:text-6xl' },
  { from: 'text-4xl lg:text-7xl', to: 'text-3xl lg:text-5xl' },
  { from: 'lg:text-8xl', to: 'lg:text-5xl' },
  { from: 'text-6xl lg:text-8xl', to: 'text-4xl lg:text-5xl' },
  { from: 'text-7xl', to: 'text-5xl' },
  { from: 'text-6xl', to: 'text-4xl' },
  { from: 'lg:p-32', to: 'lg:p-12' },
  { from: 'p-32', to: 'p-12' },
  { from: 'space-y-40', to: 'space-y-16' },
  { from: 'space-y-32', to: 'space-y-12' },
  { from: 'space-y-24', to: 'space-y-8' },
  { from: 'space-y-16', to: 'space-y-6' },
  { from: 'py-20', to: 'py-8' },
  { from: 'py-12', to: 'py-6' },
  { from: 'py-24', to: 'py-12' },
  { from: 'mb-48', to: 'mb-16' },
  { from: 'mt-24', to: 'mt-12' },
  { from: 'gap-24', to: 'gap-8' },
  { from: 'gap-12', to: 'gap-6' },
  { from: 'px-24 py-7', to: 'px-12 py-4' },
  { from: 'px-14 py-7', to: 'px-8 py-4' },
  { from: 'text-3xl font-arabic font-black mb-4', to: 'text-xl font-arabic font-black mb-4' },
  { from: 'text-3xl font-arabic font-black text-white tracking-tighter leading-none', to: 'text-xl font-arabic font-black text-white tracking-widest' },
  { from: 'lg:p-20', to: 'lg:p-12' },
  { from: 'p-8 lg:p-12', to: 'p-6 lg:p-8' }
];

replacements.forEach(r => {
  content = content.split(r.from).join(r.to);
});

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log("Sizes reduced");
