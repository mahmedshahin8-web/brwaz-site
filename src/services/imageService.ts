import { apiFetch } from "../lib/apiFetch";

export async function generateNanoBananaImage(prompt: string): Promise<string> {
  try {
    const res = await apiFetch("/api/images/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (!res.ok) throw new Error("Image Gen failed");
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error("Image generation failed:", err);
    throw err;
  }
}

export async function editNanoBananaImageText(prompt: string, base64Image: string): Promise<string> {
   return generateNanoBananaImage(`${prompt}. The image MUST include accurate Arabic text integrating into the scene.`);
}
