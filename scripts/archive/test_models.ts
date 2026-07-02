import { GoogleGenAI } from "@google/genai";
async function test() {
  const rawKeys = process.env.GEMINI_API_KEYS?.replace(/[\[\]"'\n]/g, '') || "";
  let keys = rawKeys.split(",").map((k:string) => k.trim()).filter(Boolean);
  if (keys.length === 0) keys = [process.env.GEMINI_API_KEY || ""];
  const apiKey = keys[0];
  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.0-pro", "gemini-1.5-pro"];
  for (const m of models) {
    try {
      await ai.models.generateContent({ model: m, contents: [{role: 'user', parts:[{text: 'hi'}]}] });
      console.log(m, "SUCCESS");
    } catch(e:any) {
      console.log(m, "ERROR:", e.message);
    }
  }
}
test();
