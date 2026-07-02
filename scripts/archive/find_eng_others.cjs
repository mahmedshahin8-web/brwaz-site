const fs = require('fs');

const files = ['src/pages/ArchivePage.tsx', 'src/pages/SettingsPage.tsx'];
for (const file of files) {
  if(!fs.existsSync(file)) continue;
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
