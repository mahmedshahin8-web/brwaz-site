import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
     const ai = new GoogleGenAI(); // picks up GEMINI_API_KEY from environment
     const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: "Hello"
     });
     console.log("Success:", response.text);
  } catch(e) {
     console.log("Error:", e.message);
  }
}
run();
