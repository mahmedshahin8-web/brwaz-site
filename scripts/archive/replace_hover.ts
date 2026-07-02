import fs from 'fs';
const files = ['src/App.tsx', 'src/components/ImageWithFallback.tsx', 'src/components/TimelineEditor.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/group-active/g, 'group-hover');
  fs.writeFileSync(file, content);
}
