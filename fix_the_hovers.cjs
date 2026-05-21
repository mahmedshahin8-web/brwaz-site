const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  let original = c;
  c = c.replace(/hover:/g, 'active:');
  c = c.replace(/group-hover:/g, 'group-active:');
  
  if (c !== original) {
    fs.writeFileSync(file, c);
    console.log('Fixed hovers in', file);
  }
});
