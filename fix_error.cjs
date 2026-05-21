const fs = require('fs');
let file = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf8');
file = file.replace(/\[var\(--accent-danger, #ff4d4d\)\]/g, 'accent-danger');
file = file.replace(/\[#ff4d4d\]/g, 'accent-danger');
fs.writeFileSync('src/components/ErrorBoundary.tsx', file);
