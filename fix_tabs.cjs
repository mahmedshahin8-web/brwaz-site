const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/المخطط الزمنيEditor/g, 'TimelineEditor');
  c = c.replace(/src\/components\/ErrorBoundary\.tsx/g, 'TimelineEditor');
  
  // Replace some english tabs or text left over
  c = c.replace(/Seq /g, 'مشهد ');
  c = c.replace(/BPM/g, 'الإيقاع');
  c = c.replace(/"script"/g, '"script"'); // logic state, leave alone
  
  // Make sure to replace any other tabs
  c = c.replace(/>Script</g, '>السكريبت<');
  c = c.replace(/>Shorts</g, '>مقاطع قصيرة (Shorts)<');
  c = c.replace(/>Kit</g, '>باقة النشر<');
  c = c.replace(/>Processor</g, '>المعالج الصوتي<');
  
  c = c.replace(/Voice Configuration/g, 'إعدادات الصوت');
  c = c.replace(/Voice ID/g, 'معرف الصوت (Voice ID)');
  c = c.replace(/Save/g, 'حفظ');
  c = c.replace(/Cancel/g, 'إلغاء');
  
  fs.writeFileSync(file, c);
}

fix('src/components/TimelineEditor.tsx');
fix('src/pages/ContentCreationPage.tsx');
console.log('fixed');
