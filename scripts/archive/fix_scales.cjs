const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // change hover:scale-[0.98] / hover:scale-95 to hover:-translate-y-1 hover:shadow-lg or similar
  content = content.replace(/hover:scale-\[0\.98\]/g, 'hover:-translate-y-1 hover:shadow-lg');
  content = content.replace(/hover:scale-95/g, 'hover:scale-105');
  
  // also group-hover: -> group-hover: but we changed active: to hover: globally
  // So all group-active: is group-hover:
  
  // Maybe also adjust the main grid layout from grid-cols-1 to md:grid-cols-2 lg:grid-cols-3
  
  fs.writeFileSync(file, content);
  console.log('Fixed scales', file);
}

processFile('src/pages/ContentCreationPage.tsx');
processFile('src/components/SceneCard.tsx');
