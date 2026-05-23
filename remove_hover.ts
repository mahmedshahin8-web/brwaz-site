import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const paths = walk('src');

paths.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  // Remove hover:bg-... hover:text-...
  content = content.replace(/hover:([a-zA-Z0-9\[\]\-\/]+)/g, 'active:scale-95');
  // cleanup duplicates: active:scale-95 active:scale-95
  content = content.replace(/(active:scale-95\s+)+/g, 'active:scale-95 ');
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
