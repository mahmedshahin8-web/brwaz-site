import fs from 'fs';
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const anchor = 'export async function applyRedTeamFixes(';
const endAnchor = '} // <-- I will just replace untill the end of the file actually, wait no. Let me find the right end block';
const idx1 = code.indexOf(anchor);

// Find the end by counting braces
let openBraces = 0;
let idx2 = idx1;
let started = false;
for(let i=idx1; i<code.length; i++) {
   if (code[i] === '{') { openBraces++; started = true; }
   if (code[i] === '}') { 
      openBraces--; 
      if (started && openBraces === 0) {
         idx2 = i + 1;
         break;
      }
   }
}

const badPart = code.substring(idx1, idx2);

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

code = code.substring(0, idx1) + goodPart + code.substring(idx2);
fs.writeFileSync('src/lib/gemini.ts', code);
