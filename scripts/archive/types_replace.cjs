const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  'export type PersonaType = "النبّاش" | "برواز التاريخ" | "برواز التكنو" | "برواز الحكاوي" | "شاهد على العصر" | "الشاهد الصامت" | "الهرم الرابع" | "الدحيح";',
  'export type PersonaType = "النبّاش" | "برواز التاريخ" | "برواز التكنو" | "برواز الحكاوي" | "شاهد على العصر" | "الشاهد الصامت" | "الهرم الرابع" | "الدحيح" | "الدحيح المحقق" | "دحيح آخر الليل" | "الدحيح الاقتصادي" | "عزيزي المشاهد";'
);

fs.writeFileSync('src/types.ts', content);
