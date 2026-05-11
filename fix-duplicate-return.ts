import fs from 'fs';
let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

// Find first `return (`
const firstReturn = lines.findIndex(l => l.trim() === 'return (');
const secondReturn = lines.findIndex((l, idx) => l.trim() === 'return (' && idx > firstReturn);

console.log("First return:", firstReturn);
console.log("Second return:", secondReturn);

if (firstReturn !== -1 && secondReturn !== -1) {
  // Delete everything from first return to exactly BEFORE second return
  lines = lines.filter((_, i) => i < firstReturn || i >= secondReturn);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
} else {
  console.log("Could not find duplicate return block.");
}
