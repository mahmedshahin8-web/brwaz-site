import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '/app/applet/.env' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const models = ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite-preview'];
  for (const m of models) {
    try {
      const resp = await ai.models.generateContent({
        model: m,
        contents: 'Hi'
      });
      console.log(`${m}: SUCCESS`, !!resp.text);
    } catch (e) {
      console.log(`${m}: FAILED`, e.message);
    }
  }
}
run();
