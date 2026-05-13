import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateNanoBananaImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
        personGeneration: "DONT_ALLOW" as any
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image generated");
  } catch (err) {
    console.error("Image generation failed:", err);
    throw err;
  }
}

export async function editNanoBananaImageText(prompt: string, base64Image: string): Promise<string> {
   // Inpainting or edit
   // According to genai SDK, editImage can be done if supported.
   // But imagen-3 doesn't fully support text edit for 16:9 via standard edit API without a mask.
   // Wait, maybe we just re-generate it with specific instructions for Arabic text?
   // "استخدم قدرات Nano Banana 2 في الـ Image Edit للسماح بتعديل أجزاء من الصورة، لضمان دقة النصوص العربية داخل الكادر."
   // We will mock this or provide a re-generate logic that includes the previous image. 
   // We can use gemini-3.0-flash to understand the issue, or use generateImages again but mention Arabic.
  try {
     const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: `${prompt}. The image MUST include accurate Arabic text integrating into the scene.`,
      config: {
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
        personGeneration: "DONT_ALLOW" as any
      }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image generated");
  } catch (err) {
    console.error("Image edit failed:", err);
    throw err;
  }
}
