import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '/app/applet/.env' }); // or wherever it is
console.log('Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 'MISSING');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Hi'
    });
    console.log(`gemini-1.5-flash: SUCCESS`, !!resp.text);
  } catch (e) {
    console.log(`gemini-1.5-flash: FAILED`, e.message);
  }
}
run();
