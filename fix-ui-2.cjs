const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix old UI colors from ContentCreationPage
  content = content.replace(/bg-\[#0E1117\]/g, 'bg-black/20');
  content = content.replace(/border-\[#2A2E39\]/g, 'border-white/10');
  content = content.replace(/text-\[#E0E2E7\]/g, 'text-white');
  content = content.replace(/text-\[#8B949E\]/g, 'text-text-muted');
  content = content.replace(/placeholder-\[#8B949E\]/g, 'placeholder-text-muted/50');
  content = content.replace(/border-\[#B89B6A\]/g, 'border-accent-warning');
  content = content.replace(/ring-\[#B89B6A\]/g, 'ring-accent-warning');
  content = content.replace(/text-\[#B89B6A\]/g, 'text-accent-warning');
  content = content.replace(/bg-\[#2A2E39\]/g, 'bg-white/10');
  content = content.replace(/hover:bg-\[#3A3F4B\]/g, 'hover:bg-white/20');
  content = content.replace(/border-\[#3A3F4B\]/g, 'border-white/20');
  content = content.replace(/bg-gradient-to-r from-\[#B89B6A\] to-\[#a68a5c\]/g, 'bg-accent-warning text-bg-darker hover:bg-yellow-500');
  content = content.replace(/hover:from-\[#a68a5c\] hover:to-\[#B89B6A\]/g, '');
  content = content.replace(/text-black \/20/g, 'text-bg-darker');
  content = content.replace(/bg-gradient-to-r from-\[#B89B6A\] to-\[var\(--accent-danger, #ff4d4d\)\]/g, 'bg-gradient-to-r from-accent-warning to-accent-danger');

  // Fix stepper colors
  content = content.replace(/bg-gray-300/g, 'bg-white/5');
  content = content.replace(/border-gray-400/g, 'border-white/10');
  content = content.replace(/text-gray-400/g, 'text-text-muted');

  content = content.replace(/#B89B6A/g, '#fbbf24'); // accent warning hex
  
  fs.writeFileSync(filePath, content);
}

processFile('src/pages/ContentCreationPage.tsx');
