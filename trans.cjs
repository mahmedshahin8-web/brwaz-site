const fs = require('fs');
const files = ['src/pages/ContentCreationPage.tsx', 'src/components/TimelineEditor.tsx', 'src/components/SceneCard.tsx'];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/Export Kit as ZIP/g, 'تصدير الباقة كـ ZIP');
  c = c.replace(/Scene Architecture/g, 'معمارية المشاهد');
  
  fs.writeFileSync(file, c);
}
console.log('Done');
