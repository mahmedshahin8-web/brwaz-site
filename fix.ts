import fs from 'fs';
const text = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = text.split('\n');
// We want to delete from line 583 to line 641 inclusive (lines are 0-indexed: 582 to 640).
const newLines = lines.filter((_, idx) => idx < 582 || idx > 640);
fs.writeFileSync('src/App.tsx', newLines.join('\n'));
