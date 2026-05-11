const fs = require('fs');
let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const regex = /async function callAI\([\s\S]*?async function callWithRetry\(/;
const replacement = `async function callAI(
  prompt: string,
  schema?: any,
  engine?: string,
  onChunk?: (text: string) => void,
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let response;
    try {
      response = await ai.models.generateContentStream({
          model: "gemini-3.1-flash-preview",
          contents: prompt,
          config: {
              systemInstruction: "أنت كاتب سكريبتات وثائقية استقصائية محترف، دورك تفكيك الأنظمة والبحث عن الأنماط الخفية بأسلوب سردي ذكي، لإنتاج محتوى فريد ومختلف تماماً عن أي برامج استقصائية تقليدية",
              responseMimeType: schema ? "application/json" : "text/plain",
              responseSchema: schema || undefined,
          }
      });
    } catch (geminiErr: any) {
       if (geminiErr.message?.includes("API_KEY_INVALID") || geminiErr.message?.includes("API key not valid")) {
           throw new Error("مفتاح API غير صالح. يرجى التأكد من أنك قمت بنسخ مفتاح Gemini بشكل صحيح في الإعدادات.");
       }
       throw geminiErr;
    }
    
    let fullText = "";
    for await (const chunk of response) {
        if (chunk.text) {
            fullText += chunk.text;
            if (onChunk) onChunk(fullText);
        }
    }
    return fullText;
  } catch (err: any) {
    if (
      err.message?.includes("RESOURCE_EXHAUSTED") ||
      err.message?.includes("429")
    ) {
      throw new Error("Quota Exceeded: " + err.message);
    }
    console.error("AI Error:", err);
    throw err;
  }
}

async function callWithRetry(`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/lib/gemini.ts', content);
