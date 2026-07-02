const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace active with hover
  content = content.replace(/active:/g, 'hover:');
  content = content.replace(/group-active:/g, 'group-hover:');
  
  // Replace max-w-4xl with max-w-6xl
  content = content.replace(/max-w-4xl/g, 'max-w-7xl');
  content = content.replace(/max-w-2xl/g, 'max-w-4xl');
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

processFile('src/pages/ContentCreationPage.tsx');
processFile('src/components/SceneCard.tsx');
