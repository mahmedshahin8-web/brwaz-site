const fs = require('fs');

let file = 'src/pages/ContentCreationPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  "System_SEO_Agent": "وكيل_تحسين_محركات_البحث",
  "\\[A/B\\] Titles \\(No Cliches\\)": "عناوين مقترحة [بدون كليشيهات]",
  "Tap to Copy": "اضغط للنسخ",
  "Description & Sources \\(Injected\\)": "الوصف والمصادر (مدمجة خوارزمياً)",
  "Timestamps": "الفهرس الزمني (Chapters)",
  "SEO Tags": "الوسوم (SEO Tags)",
  "Thumbnail Prompt \\(Midjourney\\)": "أبعاد الغلاف (Midjourney Prompt)",
  "&lt; Export Kit as ZIP": "تحميل كـ ZIP ⬇",
  "\\[ Scene Architecture \\]": "[ معمارية المشاهد ]"
};

for (const [eng, ara] of Object.entries(replacements)) {
  content = content.replace(new RegExp(eng, 'g'), ara);
}

fs.writeFileSync(file, content);
console.log('Fixed English in creation page');

file = 'src/components/TimelineEditor.tsx';
content = fs.readFileSync(file, 'utf8');

const timelineReplacements = {
  "Scene Architecture": "عمارة المشاهد",
  "Timeline": "المخطط الزمني",
  "Audio Engine": "محرك الصوت"
};

for (const [eng, ara] of Object.entries(timelineReplacements)) {
  content = content.replace(new RegExp(eng, 'g'), ara);
}

fs.writeFileSync(file, content);
console.log('Fixed English in timeline');
