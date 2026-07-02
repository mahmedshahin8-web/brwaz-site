import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "What is the weather in Cairo?",
            // @ts-ignore
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
