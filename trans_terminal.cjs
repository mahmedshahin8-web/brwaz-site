const fs = require('fs');

let file = 'src/pages/ContentCreationPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/SYSTEM_TERMINAL \/\/ PIPELINE_EXECUTION/g, "شاشة النظام // جاري التنفيذ");
c = c.replace(/\[ERROR\] PIPELINE_FAILED/g, "[خطأ] فشل العملية");
c = c.replace(/> ERROR_SIG:/g, "> إشارة الخطأ:");
c = c.replace(/> ABORT_AND_RETRY/g, "> الغاء والمحاولة مرة أخرى");
c = c.replace(/STATUS: ACTIVE/g, "الحالة: نشط");
c = c.replace(/LIVE_STREAM/g, "بث مباشر");
c = c.replace(/\[WAITING FOR DATA\.\.\.\]/g, "[في انتظار البيانات...]");
c = c.replace(/ETA:/g, "الوقت المتبقي:");
c = c.replace(/CALCULATING\.\.\./g, "جاري الحساب...");
c = c.replace(/INCOMING CLASSIFIED DATA/g, "بيانات سرية واردة");
c = c.replace(/DOC ID:/g, "رقم الوثيقة:");
c = c.replace(/TYPE: EDITORIAL/g, "النوع: تحريري");

fs.writeFileSync(file, c);
console.log('translated terminal strings');
