import { apiFetch } from "../lib/apiFetch";
import { EpisodeScene } from "../types";

export interface VideoGenResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

/**
 * Generates a video using the Grok API proxy.
 */
export async function generateGrokVideo(
  firstFrame: string, 
  secondFrame: string, 
  motionPrompt: string,
  aspectRatio?: string
): Promise<string> {
  try {
    const res = await apiFetch("/api/video/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstFrame, secondFrame, motionPrompt, aspectRatio })
    });

    if (!res.ok) throw new Error("Video generation failed at origin");
    const data = await res.json();
    return data.videoUrl;
  } catch (err) {
    console.error("[VIDEO_SERVICE_ERROR]", err);
    throw err;
  }
}

/**
 * Smart Chaining Logic:
 * Ensures visual flow between scenes based on the transition type.
 * If 'Match Cut' or 'Same Scene', the first frame of the current scene 
 * is set to the second frame of the previous scene.
 */
export function applySmartChaining(scenes: EpisodeScene[]): EpisodeScene[] {
  return scenes.map((scene, index) => {
    if (index === 0) return scene; // First scene has no predecessor

    const prevScene = scenes[index - 1];
    const shouldChain = 
      scene.transition_to_next_scene === "Match Cut" || 
      scene.transition_to_next_scene === "Same Scene";

    if (shouldChain && prevScene.second_frame_url) {
      console.log(`[SmartChaining] Scene ${index} first_frame matched to Scene ${index-1} second_frame`);
      return {
        ...scene,
        first_frame_url: prevScene.second_frame_url
      };
    }

    return scene;
  });
}
