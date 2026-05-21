const fs = require('fs');

const files = ['src/components/layout/Sidebar.tsx', 'src/App.tsx'];
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');

  const matches = c.match(/>[A-Za-z0-9 _-]{3,}</g);
  if (matches) {
    const uniq = [...new Set(matches)];
    console.log(`English UI Texts in ${file}:`);
    console.log(uniq.join('\n'));
  } else {
    console.log(`No english UI text found in ${file}.`);
  }
}

