import fs from 'fs';
let content = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

// The problematic string is:
//   </example>`).join('
// ');
// Let's just find and replace it!

content = content.replace("</example>\`).join('\\n');", "</example>\`).join('\\\\n');");

// There are multiple instances of `.join('\n')` that are broken as actual newlines.
// Let's replace any `join('\n')` with `join('\\n')` 
content = content.replace(/join\('\\n'\);/g, "join('\\\\n');");
content = content.replace(/join\("\\n"\);/g, "join('\\\\n');");

// Wait, the file literally has a string parameter that has a newline due to being joined!
// Example:
// join('
// ') 
// Let's literally fix that!
content = content.replace(/join\('[\r\n]+'\)/g, "join('\\\\n')");
content = content.replace(/join\("[\r\n]+"\)/g, 'join("\\\\n")');

fs.writeFileSync('src/lib/gemini.ts', content);
