import fs from 'fs';
const content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');
const lines = content.split('\n');
// We want to remove lines 2871 to 2884 (1-indexed)
// Wait, better yet, just look for the pattern of repeated copyToClipboard.
let newLines = [];
let skip = false;
let copyCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('copyToClipboard={(text) => {')) {
    copyCount++;
    if (copyCount > 1) {
       // Start skipping until next prop or closing tag
       skip = true;
    }
  }
  if (skip) {
    if (lines[i].includes('}}')) {
       // End of this duplicate block
       skip = false;
       continue;
    }
    continue;
  }
  // Also clear the one empty line I saw 2884
  if (i === 2883 && lines[i].trim() === '') continue;

  newLines.push(lines[i]);
  
  // Reset copyCount if we see a new scene card
  if (lines[i].includes('<SceneCard')) {
    copyCount = 0;
  }
}
fs.writeFileSync('src/pages/ContentCreationPage.tsx', newLines.join('\n'));
