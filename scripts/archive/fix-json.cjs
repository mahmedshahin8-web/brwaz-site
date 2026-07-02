const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf8');

code = code.replace('}\\n\\nexport function applyGlobalStyle', `  } catch (e) {
    console.error("JSON Parse Error:", (e as Error).message, "Raw Text:", text);
    return fallback;
  }
}

export function applyGlobalStyle`);

fs.writeFileSync('src/lib/gemini.ts', code);
console.log("Fixed manually");
