import fs from 'fs';

let text = fs.readFileSync('src/lib/agents.ts', 'utf8');

const agent5Text = `
export async function executeAgent5_Publisher(
  videoTitle: string,
  researchMapStr: string,
  mood: MoodType,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<{ 
  youtube_titles: string[], 
  thumbnail_prompt: string, 
  description: string, 
  tags: string[],
  chapters: { title: string, timestamp: string }[]
}> {
  const basePrompt = \`[Agent: SEO & Publishing Kit Manager]
You are a master YouTube strategist handling a highly analytical and mysterious channel.
Your task is to generate the final packaging metadata based on the research map.

Video Title Idea: "\${videoTitle}"
Research Map:
\${researchMapStr}

RULES:
1. A/B Titles (youtube_titles): Suggest 3 highly mysterious, intellectual, and zero-cliche titles. Do not use cheap hooks like "لن تصدق". They must ask a deep philosophical question or tease a dark historical puzzle.
2. Description (description): Write a professional, mysterious description teasing the episode's knot/climax. NO CLICHES.
3. Chapters (chapters): Generate 4-7 timestamps (e.g. "00:00") marking logical sections of the video based on the research map.
4. Tags (tags): Extract 10-15 highly relevant SEO keywords.
5. Thumbnail Prompt (thumbnail_prompt): Write a Midjourney AI prompt (in English) describing a dark, intriguing, cinematic thumbnail.

Output STRICT JSON:
{
  "youtube_titles": ["title 1", "title 2", "title 3"],
  "description": "string",
  "thumbnail_prompt": "string",
  "tags": ["tag1", "tag2"],
  "chapters": [ { "title": "Intro...", "timestamp": "00:00" } ]
}
\`;

  const prompt = IdentityMiddleware.injectPersona(basePrompt, persona);

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(
      prompt, 
      {
        type: "OBJECT",
        properties: {
          youtube_titles: { type: "ARRAY", items: { type: "STRING" } },
          description: { type: "STRING" },
          thumbnail_prompt: { type: "STRING" },
          tags: { type: "ARRAY", items: { type: "STRING" } },
          chapters: { 
            type: "ARRAY", 
            items: { 
              type: "OBJECT", 
              properties: { title: { type: "STRING" }, timestamp: { type: "STRING" } },
              required: ["title", "timestamp"]
            } 
          }
        },
        required: ["youtube_titles", "description", "thumbnail_prompt", "tags", "chapters"]
      }, 
      engine, 
      onChunk,
      undefined,
      false,
      0.6 // Slightly lower temperature for creative but focused titles
    );
    return safeJsonParse(rawContent, {
      youtube_titles: [],
      description: "",
      thumbnail_prompt: "",
      tags: [],
      chapters: []
    });
  });
}
`;

text += agent5Text;
fs.writeFileSync('src/lib/agents.ts', text);
console.log('Added executeAgent5_Publisher');
