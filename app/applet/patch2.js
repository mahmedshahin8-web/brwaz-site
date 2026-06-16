
const fs = require('fs');

const patch = `
export type MoodType = "أرشيف الضلمة" | "كلاكيت وتزوير" | "خرافات شعبية" | "سبوبة ولا ابتكار" | "صراع العروش الشركاتي" | "مخابرات وأسياد" | "زمن الفن الجميل" | "الديستوبيا الجاية";

export function getMoodContext(mood: MoodType): any {
  return { archivalTreasureRules: "", scriptingStyle: "", visualAudioStyle: "" };
}

export function getSystemPrompt(): string {
  return "You are a master AI.";
}

export async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, signal?: AbortSignal): Promise<T> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

export function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    const jsonStr = text.replace(/\\x60\\x60\\x60json/g, '').replace(/\\x60\\x60\\x60/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return fallback;
  }
}

export function applyGlobalStyle(prompt: string): string {
  if (!prompt) return "";
  return prompt + " --v 6.0";
}

export async function generateAIContentRaw(
  prompt: string,
  schema: any,
  engine: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  ignoreType?: boolean,
  temperature?: number
): Promise<string> {
  return JSON.stringify({});
}

export async function generateTitle(topic: string, mood: MoodType, persona: any, engine: string, signal?: AbortSignal): Promise<string> {
   return topic + " (Generated Title)";
}

export async function generateResearchMap(topic: string, durationMinutes: number, mood: MoodType, note: string, engine: string, signal?: AbortSignal): Promise<any> {
   return { video_title: "Title", thumbnail: { image_prompt: "", text_on_image: "" }, sources: [] };
}

export async function executeNode0_OSINT(
  topic: string, mood: MoodType, persona: any, engine: string, onChunk?: any
): Promise<any> {
  return { id: "1", topic, created_at: "", last_updated: "", executive_summary: "", timeline: [], key_entities: [],  verified_facts: [], hidden_patterns_or_contradictions: [], historical_visual_anchors: [], sources: [], compiled_research_context: "" };
}

export async function generateChapter(topic: string, chapterOutline: any, engine: string, signal?: AbortSignal): Promise<any> {
   return [];
}

export async function generatePackaging(topic: string, mood: MoodType, engine: string, signal?: AbortSignal): Promise<any> {
   return { packaging: { youtube_titles: [], description: "", thumbnail_prompt: "", tags: [] }, shorts: [] };
}

export interface Node3Visuals { scenes: any[] }
`;

fs.appendFileSync('src/lib/gemini.ts', patch);
console.log('Appended.');
