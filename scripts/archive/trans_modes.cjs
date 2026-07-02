const fs = require('fs');

let file = 'src/pages/ContentCreationPage.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\[2\] توجيهات الإخراج \(MODE\):/g, "[2] توجيهات الإخراج الفني:");
c = c.replace(/توجيهات الإخراج الفني \(MODES\)/g, "توجيهات الإخراج الفني والمود");

fs.writeFileSync(file, c);
console.log('translated modes');
