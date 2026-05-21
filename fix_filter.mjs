import fs from 'fs';

let text = fs.readFileSync('src/lib/gemini.ts', 'utf8');
const filterImports = `import { cleanToEgyptianArabic } from '../core/identity/identityGuard';\n`;
if (!text.includes('cleanToEgyptianArabic')) {
  text = filterImports + text;
}

text = text.replace(/if \(onChunk\) onChunk\(content\);/g, 'if (onChunk) onChunk(cleanToEgyptianArabic(content));');

text = text.replace('return content;', 'return cleanToEgyptianArabic(content);');

fs.writeFileSync('src/lib/gemini.ts', text);
console.log('Filter applied to stream & return.');
