const fs = require('fs');
const path = require('path');

const traverseAndReplace = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Dark Theme colors
      content = content.replace(/#0a0e14/gi, '#09090b');
      content = content.replace(/#05070a/gi, '#09090b'); // Extra dark
      content = content.replace(/#111722/gi, '#121214');
      content = content.replace(/#17202c/gi, '#27272a');
      
      // Text colors
      content = content.replace(/#f5f3f0/gi, '#fafafa');
      content = content.replace(/#a8a09f/gi, '#a1a1aa');
      content = content.replace(/#6d6964/gi, '#71717a');

      // Accent gold/copper/amber -> Indigo & Neutral
      content = content.replace(/#d4a574/gi, '#4f46e5');
      content = content.replace(/#c89b5a/gi, '#6366f1');
      content = content.replace(/#a0764d/gi, '#4f46e5');

      // Accent crimson -> standard red
      content = content.replace(/#a0333c/gi, '#ef4444');
      content = content.replace(/#eb2630/gi, '#ef4444');
      
      // Accent teal -> standard emerald
      content = content.replace(/#1f5a5e/gi, '#10b981');
      
      // Box shadows
      content = content.replace(/shadow-glow-gold/gi, 'shadow-sm');
      content = content.replace(/shadow-glow-teal/gi, 'shadow-sm');
      content = content.replace(/shadow-glow-copper/gi, 'shadow-sm');
      content = content.replace(/shadow-subtle/gi, 'shadow-sm');

      // Rounded modifications to make them more modern
      content = content.replace(/\brounded\b(?!-)/g, 'rounded-lg');
      content = content.replace(/\brounded-sm\b/g, 'rounded');

      // Adjust some opacity levels
      content = content.replace(/bg-\[#121214\]\/60/g, 'bg-[#121214]');
      content = content.replace(/bg-cyan-900\/40/g, 'bg-[#27272a]/50');
      content = content.replace(/backdrop-blur-md/g, ''); // remove blur on solid backgrounds
      content = content.replace(/backdrop-blur-xl/g, ''); 

      // Replace font-arabic mostly to keep it simple, or removing it if it's too much, but we'll leave it
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  });
};

traverseAndReplace(path.join(__dirname, 'src', 'pages'));
traverseAndReplace(path.join(__dirname, 'src', 'components'));
console.log('Done.');
