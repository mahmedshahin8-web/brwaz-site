import { apiFetch } from "../lib/apiFetch";
export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

export async function searchPexelsVideos(query: string): Promise<PexelsVideo[]> {
  const apiKey = (import.meta as any).env.VITE_PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error("Pexels API key not found. Please add VITE_PEXELS_API_KEY to your .env file.");
  }

  const response = await apiFetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=6`, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from Pexels API");
  }

  const data = await response.json();
  return data.videos || [];
}
