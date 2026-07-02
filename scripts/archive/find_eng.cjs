const fs = require('fs');

let file = 'src/pages/ContentCreationPage.tsx';
let c = fs.readFileSync(file, 'utf8');

const matches = c.match(/>[A-Za-z0-9 _-]{3,}</g);
if (matches) {
  const uniq = [...new Set(matches)];
  console.log("English UI Texts:");
  console.log(uniq.join('\n'));
} else {
  console.log("No english UI text found.");
}
