import fs from 'fs';

const pages = [
  'src/pages/home.tsx',
  'src/pages/ArchivePage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/pages/ScriptEditor.tsx',
  'src/pages/ContentCreationPage.tsx'
];

pages.forEach(page => {
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf8');

    // 1. Add hover states to cards
    content = content.replace(/(bg-\[\#050505\]\/60 backdrop-blur-xl border border-white\/5 rounded-sm(?! hover:border-white\/10))/g, 
                              '$1 transition-colors duration-300 hover:border-white/10 hover:bg-[#050505]/80');
    
    // 2. Change transition-none to transition-all duration-300 for generic elements
    content = content.replace(/transition-none/g, 'transition-all duration-300');

    // 3. Improve input focus states
    content = content.replace(/focus:outline-none focus:border-\[\#(.+?)\] transition-all duration-300/g, 
                              'focus:outline-none focus:border-[#$1] shadow-[0_1px_0_0_#$1_inset] transition-all duration-300');

    // 4. Improve specific empty states visually by adding subtle glow
    content = content.replace(/(border-dashed border-white\/5 rounded-sm)/g, '$1 hover:border-white/10 transition-colors');

    fs.writeFileSync(page, content);
    console.log(`Enhanced ${page}`);
  }
});
