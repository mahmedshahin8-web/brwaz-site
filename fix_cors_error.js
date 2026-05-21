import fs from 'fs';

let text = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const oldFetch = `    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: signal,
    });`;

const newFetch = `    let response;
    try {
      response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: signal,
      });
    } catch (error: any) {
       throw new Error("فشل الاتصال بسيرفر Ollama المحلي. المتصفح يمنع الاتصال، يرجى مراجعة إعدادات Ollama في التطبيق للتأكد من تفعيل CORS (OLLAMA_ORIGINS='*'). " + error.message);
    }`;

if (text.includes(oldFetch)) {
   text = text.replace(oldFetch, newFetch);
   fs.writeFileSync('src/lib/gemini.ts', text);
   console.log('Fixed CORS error handling');
} else {
   console.log("Could not find old fetch");
}
