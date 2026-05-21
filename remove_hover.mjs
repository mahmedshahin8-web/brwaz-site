import fs from 'fs/promises';
import path from 'path';

async function processDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = await fs.readFile(fullPath, 'utf8');
      
      const original = content;
      content = content.replace(/hover:/g, 'active:');
      content = content.replace(/group-hover:/g, 'group-active:');
      
      if (original !== content) {
        await fs.writeFile(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./src').catch(console.error);
