const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ContentCreationPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

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

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(`\\b${key}\\b`, 'g');
  content = content.replace(regex, value);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Theme applied successfully!');
