import { generateAIContentRaw } from "../lib/gemini"; // Temporary fallback
import type { MoodType } from "../lib/gemini";

// Simulated Local API constraints and types
export interface LiveTrend {
  id: string;
  topic: string; // The full topic idea extracted
  title: string; // Catchy short title
  severity: "عادي" | "متوسط" | "مرتفع" | "حرج";
  stats: string; // e.g. "+850% بحث"
  time: string; // e.g. "منذ 15 دقيقة"
  velocity: number; // For prioritizing trends
  source: "YouTube Comments" | "Google Trends" | "X (Twitter)" | "News API";
}

// Simulated Ollama Local Model Interface - "Scraping Filter Agent"
// In a real local setup, this would fetch from http://localhost:11434/api/generate
export async function sweepLiveTrends(): Promise<LiveTrend[]> {
  try {
    // ----------------------------------------------------------------------
    // [LOCAL RESOURCE MANAGEMENT]: Chunking strategy to avoid Ollama Overload
    // ----------------------------------------------------------------------
    // Real implementation would buffer comments and send them in chunks of 500:
    // const batches = chunkArray(scrapedComments, 500);
    // for (const batch of batches) { await processLocalOllama(batch); }
    // ----------------------------------------------------------------------

    const prompt = `
[SYSTEM DIRECTIVE: SECURE SCRAPING FILTER AGENT]
You are a local data extraction agent (Ollama node). You have just ingested a chunk of 500 recent Arabic comments (Chunk 1/10) and trending keywords.
Identify 4 burning trends that the audience is currently demanding. Give me realistic parameters. 
Respond ONLY with a valid JSON array of objects.

JSON Format required:
[{
  "id": "uuid",
  "topic": "Full detailed topic",
  "title": "Short catchy title",
  "severity": "مرتفع" or "حرج" or "متوسط",
  "stats": "String like '+400% بحث'",
  "time": "String like 'مباشر'",
  "velocity": 90,
  "source": "YouTube Comments" or "Google Trends"
}]`;

    // Using Gemini as a fallback for the Ollama local model in this web environment
    const responseText = await generateAIContentRaw(prompt, undefined, "gemini");
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr) as LiveTrend[];
  } catch (error) {
    console.error("Local Model (Sweep) Failed:", error);
    throw new Error("فشل الاتصال بالمحرك المحلي لمعالجة البيانات");
  }
}

// "Triage Agent" - Determines the deep, analytical mood based on the trend.
export async function triageTrendMood(trend: string): Promise<{ mood: MoodType; reasoning: string; recommendedNote: string }> {
  try {
    const prompt = `
[SYSTEM DIRECTIVE: TRIAGE AGENT]
You are formulating the creative direction for a serious, deep, and mysterious documentary pipeline.
The user wants to cover the following trend: "${trend}"

Analyze this trend and assign one of the ONLY allowed restricted moods to format it properly.
ALLOWED MOODS ONLY:
1. التفكيك التاريخي
2. التحليل الاستقصائي
3. الدراما السوداء
4. الغموض الفلسفي

DO NOT use superficial or generic YouTube moods. Maintain gravitas.

Return ONLY a valid JSON object:
{
  "mood": "One of the 4 allowed moods above",
  "reasoning": "A short, intellectual explanation of why this mood fits",
  "recommendedNote": "A very short, mysterious note on how to approach the script for this trend"
}
    `;

    const responseText = await generateAIContentRaw(prompt, undefined, "gemini");
    const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Triage Agent Failed:", error);
    return {
      mood: "التحليل الاستقصائي" as any,
      reasoning: "Fallback selected due to local model overload, safe investigative approach.",
      recommendedNote: "تعامل مع الموضوع بنظرة تحليلية عميقة."
    };
  }
}
