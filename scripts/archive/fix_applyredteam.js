import fs from 'fs';
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const badPart = `export async function applyRedTeamFixes(
  mood: MoodType,
  allScenes: any[],
  researchData: string,
  auditReport: SecurityAudit,
  engine = "gemini",
  signal?: AbortSignal,
  onProgress?: (progress: number, message: string) => void
): Promise<any[]> {
  if (!auditReport || !auditReport.issues || auditReport.issues.length === 0) {
    return allScenes;
  }

  onProgress?.(97, "[!] محامي الشيطان: جاري تطبيق الإصلاحات الآلية للسكريبت...");
  
  const prompt = \`[Node: The Structural Auto-Fixer]
Task: You are the Auto-Fixer phase. Your job is to rewrite the script entirely to fix the issues found by the Devil's Advocate (Red Team Audit). This might involve structural changes such as merging repetitive scenes, shortening sentences, or removing fluff.

[CRITICAL INSTRUCTIONS - CLEAN CAIRENE ORTHOGRAPHY & TTS PRONUNCIATION]:
1. Write the "voice_over" IN CLEAN CAIRENE EGYPTIAN ARABIC (روح وكلمات اللهجة القاهرية النظيفة).
2. ORTHOGRAPHY (NEGATIVE CONSTRAINT): يُمنع منعاً باتاً استبدال حرف القاف (ق) بالألف (أ)، أو الظاء (ظ) بالضاد (ض)، أو الثاء (ث) بالتاء (ت). اكتب المفردات بحروف عربية قياسية؛ الموديل الصوتي سينطقها بلهجة مصرية صحيحة بناءً على السياق.
3. TTS PRONUNCIATION & PACING (CRITICAL FOR AUDIO):
   - استخدم **التشكيل (الفتحة، الضمة، الكسرة، السكون، الشدة)** على الكلمات العامية التي قد تُقرأ بالخطأ.
   - استخدم الفواصل (،) بشكل مكثف جداً لتقسيم الجمل الطويلة. كل فاصلة تمثل أخذ (نَفَس) للمتحدث البشري.
   - استخدم الثلاث نقاط (...) قبل الصدمات لخلق وقفة تشويقية.
4. IN-LINE PROMPTS FOR GEMINI 3.1 TTS (MANDATORY): You MUST embed English performance tags and Emojis INSIDE the "voice_over" text. The AI Voice Model needs these to act! Use them at the start of paragraphs or sentences:
   - [excited] للحماس.
   - [angry] للغضب والانفعال.
   - [whispering] للهمس في الأسرار.
   - [crying] للبكاء أو الحزن.
   - [sarcastic] للسخرية من موقف.
   - [breathing fast] للتنفس السريع وقت المفاجأة.
   - [short pause] للتوقف ولفت الانتباه.
   - [laugh] للضحك.
   - REQUIRED: Use Emojis like 😂 😲 😡 😭 directly in the text to organically force emotional shifts.
5. EXTREME ANTI-LOOPING (CRITICAL): DO NOT repeat phrases! For example, if you constantly use phrases like "المفارقة إن", "الغريب إن", "و الأخطر من كده", STOP! Use completely different vocabulary in the rewritten script.
6. ANTI-HALLUCINATION & DENSITY: Cut out ANY generic filler added by previous phases. Replace it with pure facts from the Research Context. Do NOT invent information.

Review the audit report below and rewrite the FULL script. You must output a JSON array representing the new complete list of scenes. For each scene, provide the 'voice_over' and a matching 'visual_cue'. If you are merging scenes, combine their visual cues logically.

Research Context:
\${researchData}

Audit Report:
\${auditReport.issues.map((iss, index) => \`\${index + 1}. [\${iss.type}] Finding: \${iss.finding} -> Recommendation: \${iss.recommendation}\`).join('\\n')}

Original Scenes:
\${JSON.stringify(allScenes.map(s => ({ voice_over: s.voice_over, visual_cue: s.visual_cue })), null, 2)}

Return a COMPLETE JSON array of the new scenes. Each object must have 'voice_over' (string in Arabic) and 'visual_cue' (string in Arabic). You are allowed to add, merge, or delete scenes to improve the pacing.
\`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(prompt, {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          voice_over: { type: Type.STRING },
          visual_cue: { type: Type.STRING },
        },
        required: ["voice_over", "visual_cue"]
      }
    }, engine, undefined, signal);

    const fixes: {voice_over: string, visual_cue: string}[] = safeJsonParse(text, []);
    
    if (fixes && fixes.length > 0) {
      const updatedScenes = fixes.map((fix, idx) => {
          // Attempt to preserve some original elements if the structures somewhat match,
          // but mainly rely on the new voice_over and visual_cue.
          const originalScene = allScenes[idx] || {};
          return {
             ...originalScene,
             voice_over: fix.voice_over,
             visual_cue: fix.visual_cue,
          };
      });
      return updatedScenes;
    }
    return allScenes;
  }, 2, 2000, signal);
}`;

const goodPart = `export async function applyRedTeamFixes(
  mood: MoodType,
  allScenes: any[],
  researchData: string,
  auditReport: SecurityAudit,
  engine = "gemini",
  signal?: AbortSignal,
  onProgress?: (progress: number, message: string) => void
): Promise<any[]> {
  if (!auditReport || !auditReport.issues || auditReport.issues.length === 0) {
    return allScenes;
  }

  onProgress?.(97, "[!] محامي الشيطان: جاري تطبيق الإصلاحات الآلية للسكريبت (Context Pruning)...");
  
  const modifiedScenes = [...allScenes];

  for (const issue of auditReport.issues) {
     if (!issue.flawed_text_snippet) continue;
     
     // Find the scene that contains this flawed text snippet
     const sceneIndex = modifiedScenes.findIndex(s => s.voice_over && s.voice_over.includes(issue.flawed_text_snippet));
     
     if (sceneIndex === -1) continue;
     
     const sceneToFix = modifiedScenes[sceneIndex];

     const prompt = \`[Node: The Structural Auto-Fixer]
Task: You are the Auto-Fixer phase. Your job is to rewrite ONLY the flawed text snippet in the specific scene based on the Red Team Audit.

[CRITICAL INSTRUCTIONS]:
1. Write the "voice_over" IN CLEAN CAIRENE EGYPTIAN ARABIC (روح وكلمات اللهجة القاهرية النظيفة).
2. DO NOT output JSON or Markdown. Output ONLY the raw corrected text in Arabic.

=== FLAWED SNIPPET IN SCENE ===
\${issue.flawed_text_snippet}

=== FULL SCENE VOICEOVER CONTEXT ===
\${sceneToFix.voice_over}

=== RED TEAM AUDIT ISSUE ===
Finding: \${issue.finding}
Recommendation: \${issue.recommendation}

Rewrite the FLAWED SNIPPET to address the feedback. Only output the rewritten snippet.
\`;

     try {
        const correctedRaw = await callWithRetry(async () => {
          const delayMs = engine === "ollama" ? 2000 : 1000;
          await new Promise(r => setTimeout(r, delayMs));
          return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.4);
        });

        if (correctedRaw && correctedRaw.trim().length > 5 && !correctedRaw.includes("=== FLAWED SNIPPET ===")) {
           // Replace the snippet in the scene's voice_over
           modifiedScenes[sceneIndex] = {
               ...modifiedScenes[sceneIndex],
               voice_over: modifiedScenes[sceneIndex].voice_over.replace(issue.flawed_text_snippet, correctedRaw.trim())
           };
        }
     } catch (e) {
        console.error("Failed to correct scene snippet", e);
     }
  }

  return modifiedScenes;
}`;

code = code.replace(badPart, goodPart);

fs.writeFileSync('src/lib/gemini.ts', code);
