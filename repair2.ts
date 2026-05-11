import fs from 'fs';

let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const replacement = `
Topic: \${topic}
\`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          episode_theme: { type: Type.STRING },
          scenes_outline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_number: { type: Type.NUMBER },
                core_fact: { type: Type.STRING },
                visual_concept: { type: Type.STRING },
              },
              required: ["scene_number", "core_fact", "visual_concept"],
            },
          },
        },
        required: ["episode_theme", "scenes_outline"],
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    try {
      const validatedData = Node1Schema.parse(parsedData);
      await saveCachedStructure(topic, validatedData);
      return validatedData;
    } catch (e) {
      console.error("Zod Validation Error:", e);
      throw new Error("Validation Failed on Node 1 output");
    }
  });
}

export const Node2BatchSchema = z.object({
  scenes: z.array(Node2Schema)
});

export async function executeNode2_Batch(
  scenes: Node1Structure["scenes_outline"],
  topic: string,
  mood: MoodType,
  previousScript: string,
  researchData: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<Node2Script[]> {
  const moodContext = getMoodContext(mood);
  
  const prompt = \`You are the "Scripting Node" (Node 2) of the Nabash Production Engine. Your task is to write the voiceover script and visual prompts for a batch of consecutive scenes based on the OSINT chapter structure.

RULES:
1. SCRIPTING STYLE: \${moodContext.scriptingStyle}
2. NO CLICHES: Never use "ahla bik", "khalina ntfq", "fel bedaya". Get straight to the point.
3. SCENES: You are given \${scenes.length} scenes to write. Write a complete, dramatic, cohesive script spanning these scenes.
4. IDENTITY GUARD: The english_image_prompt MUST NOT contain descriptions of human faces or specific people. Use abstract representations, environments, objects, and silhouettes.

PREVIOUS SCRIPT CONTEXT (Continue seamlessly from this):
"\${previousScript}"

SCENES TO WRITE IN THIS BATCH:
\${scenes.map((s, idx) => \`[\${idx + 1}] Core Fact: \${s.core_fact} | Visual Concept: \${s.visual_concept}\`).join('\\n')}

Topic: \${topic}
\`;`;

const startIndex = content.indexOf(`Topic: \${topic}
\`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          scenes: {`);

if (startIndex === -1) {
    console.error("NOT FOUND");
    process.exit(1);
}

content = content.substring(0, startIndex) + replacement + content.substring(startIndex + `Topic: \${topic}\n\`;`.length);

fs.writeFileSync('src/lib/gemini.ts', content);
console.log("FIXED!");
