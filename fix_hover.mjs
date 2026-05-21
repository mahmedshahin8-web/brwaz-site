import { promises as fs } from 'fs';

async function updateFile(path) {
  let text = await fs.readFile(path, 'utf8');
  
  // Replace hover states with active states for mobile-first tap feedback
  text = text.replace(/hover:bg-/g, 'active:bg-');
  text = text.replace(/hover:border-/g, 'active:border-');
  text = text.replace(/hover:text-/g, 'active:text-');
  text = text.replace(/hover:shadow-/g, 'active:shadow-');
  text = text.replace(/group-hover:bg-/g, 'group-active:bg-');
  text = text.replace(/group-hover:border-/g, 'group-active:border-');
  text = text.replace(/group-hover:text-/g, 'group-active:text-');
  text = text.replace(/group-hover:opacity-/g, 'group-active:opacity-');
  text = text.replace(/group-hover:/g, 'group-active:');
  
  // Also enforce Blueprint CSS (dark mode with thin grid)
  // Let's check ContentCreationPage and add the grid background.
  
  await fs.writeFile(path, text);
  console.log('Updated ' + path);
}

async function main() {
  await updateFile('src/pages/ContentCreationPage.tsx');
  await updateFile('src/components/layout/Sidebar.tsx');
}

main().catch(console.error);
