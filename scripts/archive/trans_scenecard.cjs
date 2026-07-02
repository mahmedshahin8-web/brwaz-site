const fs = require('fs');

let file = 'src/components/SceneCard.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/Failed to rewrite/g, "فشلت عملية إعادة الكتابة");
c = c.replace(/Failed to generate image/g, "فشل في توليد الصورة");
c = c.replace(/Failed to edit image/g, "فشل في تعديل الصورة");
c = c.replace(/API Limit or Invalid Key/g, "خطأ في المفتاح أو تجاوز الحد الأقصى للاستخدام");
c = c.replace(/Download MP3 \(Requires ElevenLabs Key\)/g, "تحميل MP3 (يتطلب مفتاح ElevenLabs)");
c = c.replace(/Teleprompter Voice Preview/g, "معاينة صوتية للنص");

fs.writeFileSync(file, c);
console.log('translated alerts in scenecard');
