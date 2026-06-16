const fs = require('fs');

let c = fs.readFileSync('src/lib/gemini.ts', 'utf8');

// 1. Fix العدسة السردية cases (Lines 132-146)
c = c.replace(/return coreAnchor \+ "\n/g, 'return coreAnchor + "\\n');

// 2. Fix the split('\n') literals everywhere
c = c.replace(/split\('\n\n\n'\)/g, "split('\\n\\n\\n')");
c = c.replace(/split\('\n\n'\)/g, "split('\\n\\n')");
c = c.replace(/split\('\n'\)/g, "split('\\n')");

// 3. Fix the join('\n') literals everywhere
c = c.replace(/join\('\n\n\n'\)/g, "join('\\n\\n\\n')");
c = c.replace(/join\('\n\n'\)/g, "join('\\n\\n')");
c = c.replace(/join\('\n'\)/g, "join('\\n')");

// 4. Fix the regex in safeJsonParse (Line ~876)
// Current broken text has a literal backslash followed by physical newline
const brokenRegexBlock = "cleanedText = cleanedText.replace(/([\\\"}\\\\]])\\\\s*\\\n\\\\s*\\\"/g, '$1,\\\n\\\"');";
const fixedRegexBlock = "cleanedText = cleanedText.replace(/([\\\"}\\\\]])\\\\s*\\\\n\\\\s*\\\"/g, '$1,\\\\n\\\"');";
c = c.replace("cleanedText = cleanedText.replace(/([\"}\\]])\\\\s*\\\n\\\\s*\"/g, '$1,\\\n\"');", fixedRegexBlock);

// 5. Fix the regex un-escaping error evaluating script quality that might exist
// Oh wait, TS1002 Unterminated string literal on line 2289
// 2289 is the `split('\n\n\n')` which is fixed above.

// Let's write the file back
fs.writeFileSync('src/lib/gemini.ts', c);
console.log("Fixed broken newlines!");
