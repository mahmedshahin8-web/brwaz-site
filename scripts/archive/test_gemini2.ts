import { GoogleGenAI } from "@google/genai";

async function run() {
  console.log("Key length:", process.env.GEMINI_API_KEY?.length);
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: "Hello"
     });
     console.log("Success:", response.text);
  } catch(e: any) {
     console.log("Error:", e.message);
  }
}
run();
