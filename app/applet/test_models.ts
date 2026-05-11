import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  for (const m of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']) {
    try {
      const resp = await ai.models.generateContent({
        model: m,
        contents: 'Hi'
      });
      console.log(`${m}: SUCCESS`);
    } catch (e) {
      console.log(`${m}: FAILED`, e.message);
    }
  }
}
run();
