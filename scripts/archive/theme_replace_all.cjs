const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white': 'bg-[#111722]/60 backdrop-blur-md',
  'bg-gray-50': 'bg-[#17202c]/50',
  'bg-gray-100': 'bg-[#111722]',
  'bg-gray-200': 'bg-[#17202c]',
  'bg-gray-800': 'bg-[#0a0e14]',
  'bg-gray-900': 'bg-[#0a0e14]',
  
  'border-gray-100': 'border-[#17202c]',
  'border-gray-200': 'border-[#17202c]',
  'border-gray-300': 'border-[#a0764d]/30',
  
  'text-gray-900': 'text-[#f5f3f0]',
  'text-gray-800': 'text-[#f5f3f0]',
  'text-gray-700': 'text-[#e5e3e0]',
  'text-gray-600': 'text-[#a8a09f]',
  'text-gray-500': 'text-[#6d6964]',
  'text-gray-400': 'text-[#6d6964]',
  'text-gray-300': 'text-[#6d6964]/50',
  
  'bg-blue-600': 'bg-[#d4a574]',
  'bg-blue-500': 'bg-[#a0764d]',
  'bg-blue-100': 'bg-[#17202c]',
  'bg-blue-50': 'bg-[#111722]',
  
  'text-blue-600': 'text-[#d4a574]',
  'text-blue-500': 'text-[#c89b5a]',
  'text-blue-700': 'text-[#d4a574]',
  'text-blue-400': 'text-[#c89b5a]',
  
  'border-blue-600': 'border-[#d4a574]',
  'border-blue-500': 'border-[#a0764d]',
  'border-blue-200': 'border-[#a0764d]/30',
  'border-blue-300': 'border-[#a0764d]/50',
  
  'bg-red-50': 'bg-[#a0333c]/10',
  'text-red-500': 'text-[#a0333c]',
  'text-red-600': 'text-[#a0333c]',
  
  'shadow-sm': 'shadow-subtle',
  'shadow-md': 'shadow-medium',
  'shadow-lg': 'shadow-deep'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fullPath.includes('home.tsx') || fullPath.includes('Sidebar.tsx') || fullPath.includes('ContentCreationPage.tsx') || fullPath.includes('DashboardLayout.tsx')) {
         continue; // Skipped already processed
      }
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, value);
            changed = true;
        }
      }
      if (changed) {
         fs.writeFileSync(fullPath, content, 'utf8');
         console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'pages'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('All files processed!');
