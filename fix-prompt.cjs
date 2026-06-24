const fs = require('fs');

const goodCode = `  // 1. Remove think tags from reasoning models
  clean = clean.replace(/<think>[\\s\\S]*?<\\/think>/gi, '');

  // 2. Clear out common unquoted number-with-unit values after a colon (Strict boundary to prevent catastrophic backtracking)
  clean = clean.replace(/:\\s*(\\d+(?:\\.\\d+)?)\\s+([a-zA-Z\\u0600-\\u06FF]+)\\s*(?=,|\\n|})/g, ':"$1 $2"');

  // 3. Let's fix some possible unquoted "true or false" values to just standard boolean (false)
  clean = clean.replace(/:\\s*true\\s+or\\s+false/gi, ': false');
  clean = clean.replace(/:\\s*false\\s+or\\s+true/gi, ': false');

  return clean;
}

export function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    if (!text || typeof text !== "string") return fallback;
    let clean = text.trim();
    
    // preprocess common LLM JSON landmines
    clean = preprocessJSONstring(clean);
    
    // remove markdown wrappers first
    clean = clean.replace(/^\`\`\`([a-z]*)\\s*/gim, '').replace(/\`\`\`\\s*$/gim, '').trim();
    
    // Extract JSON block if there's surrounding text
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;
    
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIndex = firstBracket;
        endIndex = clean.lastIndexOf(']');
    } else if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIndex = firstBrace;
        endIndex = clean.lastIndexOf('}');
    }
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        clean = clean.substring(startIndex, endIndex + 1);
    }
    
    try {
        clean = jsonrepair(clean);
    } catch {
        // if jsonrepair fails, we'll let JSON.parse attempt it and catch
    }
    
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error:", (e as Error).message, "\\nRaw Text:\\n", text);
    return fallback;
  }
}`;

let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');
const start = code.indexOf('  // 1. Remove think tags from reasoning models');
const end = code.indexOf('export function applyGlobalStyle(');
if (start !== -1 && end !== -1) {
    code = code.substring(0, start) + goodCode + "\\n\\n" + code.substring(end);
    fs.writeFileSync('src/lib/gemini.ts', code);
    console.log("Fixed corrupted JSON parse!");
} else {
    console.log("Could not find start or end!");
}
