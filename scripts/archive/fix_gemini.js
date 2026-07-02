import fs from 'fs';
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const badPart = `    const parsedClimax   Scripting Style: \${moodContext.scriptingStyle}

PREVIOUS SCRIPT CONTEXT (Continue seamlessly from this):
"\${previousScript}"

SCENES TO WRITE IN THIS BATCH:
\${scenes.map((s, idx) => \`[\${idx + 1}] Core Fact: \${s.core_fact} | Visual Concept: \${s.visual_concept}\`).join('\\n')}

Topic: \${topic}

OUTPUT FORMAT:
You MUST return ONLY a valid JSON object with the following structure:
{
  "scenes": [
    {
      "scene_id": "string",
      "voiceover_text": "string (with [صمت درامي] and 🔊)",
      "voiceover_notes": "string (notes for human VO artist, tone, pacing)",
      "estimated_duration_seconds": number,
      "dramatic_pause_seconds": number,
      "camera_and_vision": "string (narrative metaphors, intense close-ups, environmental storytelling)",
      "cinematic_movement": "string (exact camera commands like Slow Dolly-In, Pan, Tilt, Tracking)",
      "visual_motif": "string (Microfilm effect, leaked documents, conceptual framing)",
      "visual_color_grading": "string (How Navy, Gold, Ivory are distributed here)",
      "montage_instructions": "string (cut speed, transitions, graphic overlays)",
      "english_image_prompt": "string (NO HUMAN FACES. Mention Navy, Ivory, Gold)",
      "ai_video_prompt": "string (Motion prompt for Runway/Kling based on the camera and vision, in English)",   allScenes = allScenes.concat(scenes);`;

const goodPart = `    const parsedClimax = safeJsonParse(climaxText);
    if (parsedClimax && parsedClimax.scene) {
       parsedClimax.scene.asset_id = \`Scene_Climax\`;
       allScenes.push(parsedClimax.scene);
    }
  }

  return allScenes;
}

export async function generateEpisode(
  title: string,
  durationValue: number,
  note: string,
  mood: MoodType,
  onProgress?: (p: number, status: string) => void,
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<EpisodeData> {
  onProgress?.(10, "[PHASE_1] // اختراق قواعد البيانات وبناء الهيكل...");
  const design = await generateResearchMap(
    title,
    durationValue,
    mood,
    note,
    engine,
    onChunk,
    signal
  );

  onProgress?.(30, "المرحلة الثانية: بناء المشاهد...");
  let allScenes: EpisodeScene[] = [];
  let previousSummary = "";
  const chapters = design.chapters || [];
  const targetWordsPerChapter = Math.round(
    (durationValue * 130) / Math.max(1, chapters.length),
  );

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    onProgress?.(
      30 + Math.floor((40 * (i + 1)) / chapters.length),
      \`[WRITING] // صياغة الملف التوثيقي - قسم \${i + 1}...\`,
    );
    const scenes = await generateChapter(
      chapter,
      design.research_data,
      mood,
      previousSummary,
      i === 0,
      i === chapters.length - 1,
      design.video_title,
      targetWordsPerChapter,
      engine,
      onChunk,
      signal
    );
    allScenes = allScenes.concat(scenes);`;

code = code.replace(badPart, goodPart);


const badPart2 = `   Scripting Style: $  // 2. Loop/Correction
  if (auditResult && auditResult.issues && auditResult.issues.length > 0) {
    onProgress?.(48, "محامي الشيطان يراجع السكريبت... جاري التصحيح الذاتي (Context Pruning)");
    
    for (const issue of auditResult.issues) {
      if (!issue.flawed_text_snippet || !masterScript.includes(issue.flawed_text_snippet)) continue;

      const correctionPrompt = \`You are a Senior Scriptwriter. Review the following flawed text snippet based on the attached Red Team Audit.
Fix the issue and rewrite the snippet. 
CRITICAL: You MUST output ONLY the newly rewritten snippet text in Arabic. Do not output any markdown formatting, JSON, or conversational text.

=== FLAWED SNIPPET ===
\${issue.flawed_text_snippet}

=== RED TEAM AUDIT ===
Finding: \${issue.finding}
Recommendation: \${issue.recommendation}
\`;

      try {
        const correctedRaw = await callWithRetry(async () => {
          const delayMs = scriptEngine === "ollama" ? 2000 : 1000;
          await new Promise(r => setTimeout(r, delayMs));
          return await generateAIContentRaw(correctionPrompt, null, scriptEngine, undefined, undefined, false, 0.3);
        });

        if (correctedRaw && correctedRaw.trim().length > 5) {
          masterScript = masterScript.replace(issue.flawed_text_snippet, correctedRaw.trim());
        }
      } catch (e) {
        console.error("Failed to correct snippet", e);
      }
    }
  }_video_prompt": "string (Motion prompt for Runway/Kling based on the camera and vision, in English)",`;

const goodPart2 = `   Scripting Style: \${moodContext.scriptingStyle}

PREVIOUS SCRIPT CONTEXT (Continue seamlessly from this):
"\${previousScript}"

SCENES TO WRITE IN THIS BATCH:
\${scenes.map((s, idx) => \`[\${idx + 1}] Core Fact: \${s.core_fact} | Visual Concept: \${s.visual_concept}\`).join('\\n')}

Topic: \${topic}

OUTPUT FORMAT:
You MUST return ONLY a valid JSON object with the following structure:
{
  "scenes": [
    {
      "scene_id": "string",
      "voiceover_text": "string (with [صمت درامي] and 🔊)",
      "voiceover_notes": "string (notes for human VO artist, tone, pacing)",
      "estimated_duration_seconds": number,
      "dramatic_pause_seconds": number,
      "camera_and_vision": "string (narrative metaphors, intense close-ups, environmental storytelling)",
      "cinematic_movement": "string (exact camera commands like Slow Dolly-In, Pan, Tilt, Tracking)",
      "visual_motif": "string (Microfilm effect, leaked documents, conceptual framing)",
      "visual_color_grading": "string (How Navy, Gold, Ivory are distributed here)",
      "montage_instructions": "string (cut speed, transitions, graphic overlays)",
      "english_image_prompt": "string (NO HUMAN FACES. Mention Navy, Ivory, Gold)",
      "ai_video_prompt": "string (Motion prompt for Runway/Kling based on the camera and vision, in English)",`;

code = code.replace(badPart2, goodPart2);

fs.writeFileSync('src/lib/gemini.ts', code);
