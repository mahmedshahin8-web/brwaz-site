import fs from 'fs';
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const badPart = `  // 2. Loop/Correction
  if (auditResult && auditResult.issues && auditResult.issues.length > 0) {
    onProgress?.(48, "محامي الشيطان يراجع السكريبت... جاري التصحيح الذاتي وبناء النسخة النهائية");
    
    const draftV1Json = JSON.stringify({ script: draftV1 }, null, 2);
    const correctionPrompt = \`You are a Senior Scriptwriter. Review your initial draft based on the attached Red Team Audit. Fix all historical hallucinations, remove redundancies, and improve the pacing. CRITICAL: You MUST output the final revised script in the EXACT SAME JSON FORMAT as the initial draft. Do not add any conversational text.

=== INITIAL DRAFT ===
\${draftV1Json}

=== RED TEAM AUDIT ===
\${JSON.stringify(auditResult, null, 2)}
\`;

    const correctedRaw = await callWithRetry(async () => {
      const delayMs = scriptEngine === "ollama" ? 5000 : 1000;
      await new Promise(r => setTimeout(r, delayMs));
      return await generateAIContentRaw(correctionPrompt, null, scriptEngine, onChunk, undefined, false, 0.5);
    });

    const parsedCorrected = safeJsonParse(correctedRaw, { script: "" });
    if (parsedCorrected && parsedCorrected.script) {
      masterScript = parsedCorrected.script;
    }
  }`;

const goodPart = `  // 2. Loop/Correction
  if (auditResult && auditResult.issues && auditResult.issues.length > 0) {
    onProgress?.(48, "محامي الشيطان يراجع السكريبت... جاري التصحيح الذاتي (Context Pruning)");
    
    for (const issue of auditResult.issues) {
      if (!issue.flawed_text_snippet || !masterScript.includes(issue.flawed_text_snippet)) continue;

      const correctionPrompt = \`You are a Senior Scriptwriter. Review the following flawed text snippet based on the attached Red Team Audit.
Fix the issue and rewrite ONLY this exact snippet.
CRITICAL: You MUST output ONLY the newly rewritten snippet text in Arabic. Do not output any markdown formatting, JSON, or conversational text. Look at the issue and recommendation and fix this exact snippet.

=== FLAWED SNIPPET ===
\${issue.flawed_text_snippet}

=== RED TEAM AUDIT ===
Issue: \${issue.finding}
Recommendation: \${issue.recommendation}
\`;

      try {
        const correctedRaw = await callWithRetry(async () => {
          const delayMs = scriptEngine === "ollama" ? 2000 : 1000;
          await new Promise(r => setTimeout(r, delayMs));
          return await generateAIContentRaw(correctionPrompt, null, scriptEngine, undefined, undefined, false, 0.4);
        });

        if (correctedRaw && correctedRaw.trim().length > 5 && !correctedRaw.includes("=== FLAWED SNIPPET ===")) {
          masterScript = masterScript.replace(issue.flawed_text_snippet, correctedRaw.trim());
        }
      } catch (e) {
        console.error("Failed to correct snippet", e);
      }
    }
  }`;

code = code.replace(badPart, goodPart);

fs.writeFileSync('src/lib/gemini.ts', code);
