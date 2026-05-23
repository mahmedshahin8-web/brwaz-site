import { apiFetch } from "../lib/apiFetch";
export async function generateLeonardoImage(prompt: string, apiKey: string, refImageUrl: string) {
  if (!apiKey) throw new Error('يرجى إدخال Leonardo API Key في الإعدادات.');

  try {
    const styleConstant = "2D hand-drawn editorial cartoon style inspired by Salah Jaheen, flat colors, distinct thick black ink outlines, warm muted earthy color palette, vintage aesthetic, expressive and exaggerated facial features";
    const negativePrompt = "--no text, typography, letters, words, speech bubbles, 3D rendering, photorealistic, photography, CGI, modern digital art";

    // 1. Create Generation
    const response = await apiFetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: `${prompt}, ${styleConstant}`,
        negative_prompt: negativePrompt,
        modelId: "b244414b-2045-4203-9e45-ea7821644778", // Default high quality model or user-provided
        width: 1024,
        height: 768,
        num_images: 1,
        // Image Guidance (Reference Image)
        ...(refImageUrl && {
          init_image_id: refImageUrl, // In Leonardo API, you usually need to upload and get an ID, 
          // but if they provide a URL, some endpoints or versions handle it differently.
          // For this implementation, we'll assume the user provides a valid ID or we'll use regular prompt.
        })
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Leonardo API Error: ${errorData.message || response.statusText}`);
    }

    const { sdGenerationJob } = await response.json();
    const generationId = sdGenerationJob.generationId;

    // 2. Polling for Result
    const pollInterval = 2000;
    const maxRetries = 30;
    
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await apiFetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${apiKey}`
        }
      });

      if (!statusResponse.ok) continue;

      const statusData = await statusResponse.json();
      const generation = statusData.generations_by_pk;

      if (generation.status === 'COMPLETE') {
        return generation.generated_images[0].url;
      } else if (generation.status === 'FAILED') {
        throw new Error('فشل توليد الصورة في Leonardo.ai');
      }
    }

    throw new Error('انتهى الوقت المسموح لتوليد الصورة.');
  } catch (error: any) {
    console.error("Leonardo Service Error:", error);
    throw error;
  }
}
