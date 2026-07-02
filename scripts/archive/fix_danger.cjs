const fs = require('fs');
let file = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');
file = file.replace(/\[var\(--accent-danger, #ff4d4d\)\]/g, 'accent-danger');
file = file.replace(/\[#ff4d4d\]/g, 'accent-danger');
file = file.replace(/bg-\[#fbbf24\]/g, 'bg-accent-warning');
file = file.replace(/\[#fbbf24\]/g, 'accent-warning');
fs.writeFileSync('src/pages/ContentCreationPage.tsx', file);
