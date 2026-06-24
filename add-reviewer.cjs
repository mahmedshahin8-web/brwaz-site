const fs = require('fs');

let code = fs.readFileSync('src/lib/agents.ts', 'utf8');

const similarityFn = `
function calculateSimilarityScore(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim().replace(/[^a-z0-9أ-ي]/g, '');
  const s2 = str2.toLowerCase().trim().replace(/[^a-z0-9أ-ي]/g, '');
  if (s1 === s2) return 1;
  // If one contains the other entirely and is reasonably long
  if ((s1.includes(s2) && s2.length > 20) || (s2.includes(s1) && s1.length > 20)) return 0.9;
  return 0;
}
`;

if (!code.includes('calculateSimilarityScore')) {
  // insert before executeAgent2_Director
  const targetFn = 'export async function executeAgent2_Director';
  code = code.replace(targetFn, similarityFn + '\n' + targetFn);
}

// Modify mapping inside executeAgent2_Director
const targetMap = `const properlyMapped = parsed.scenes.map((s: any) => ({
        scene_id: s.scene_id,
        visual_cue: s.visual_concept,
        clean_tts: s.clean_tts || s.script_line,
        voice_over: s.voiceover_text || s.clean_tts || s.script_line, // Use voice_over!
        image_prompt: s.image_prompt || "",
        sound_design: s.sound_design || "",
        b_roll_search_query: s.b_roll_search_query || "",
        montage_instructions: s.montage_instructions || "",
        estimated_duration_seconds: s.estimated_duration_seconds || 15
      }));
      allScenes.push(...properlyMapped);`;

const replacementMap = `const properlyMapped: any[] = [];
      const reviewAgentRejectLog = [];
      for (const s of parsed.scenes) {
        const text = s.clean_tts || s.script_line || "";
        const visual = s.visual_concept || "";
        
        // Agent 2.5: Deep Scene Reviewer (Deduplication)
        // وكيل المراجعة: فحص التكرار بدقة
        const isDuplicate = [...allScenes, ...properlyMapped].some(existing => {
           const existingText = String(existing.clean_tts || "");
           const existingVisual = String(existing.visual_cue || "");
           if (existingText.length > 5 && text.length > 5 && calculateSimilarityScore(text, existingText) > 0.8) return true;
           if (existingVisual.length > 10 && visual.length > 10 && calculateSimilarityScore(visual, existingVisual) > 0.8) return true;
           return false;
        });

        if (isDuplicate) {
            reviewAgentRejectLog.push(s.scene_id || "Scene");
            continue; // 🚫 Refuse duplicated scene (مرفوض)
        }

        properlyMapped.push({
          scene_id: s.scene_id,
          visual_cue: visual,
          clean_tts: text,
          voice_over: s.voiceover_text || text, 
          image_prompt: s.image_prompt || "",
          sound_design: s.sound_design || "",
          b_roll_search_query: s.b_roll_search_query || "",
          montage_instructions: s.montage_instructions || "",
          estimated_duration_seconds: s.estimated_duration_seconds || 15
        });
      }
      if (reviewAgentRejectLog.length > 0 && onProgressUpdate) {
         onProgressUpdate(100, \`[وكيل المراجعة] 🚫 تم رصد ورفض مشاهد مكررة: \${reviewAgentRejectLog.length} مشهد.\`);
      }
      
      allScenes.push(...properlyMapped);`;

if (code.includes('const properlyMapped = parsed.scenes.map')) {
  code = code.replace(targetMap, replacementMap);
  
  // Let's also enforce it in the prompt to prevent the model from wasting tokens
  const oldPromptReq = 'Crucial Zero-Drop Rule: You MUST map EVERY SINGLE WORD and SENTENCE from the script segment exactly into the scenes. DO NOT summarize, drop, or rewrite any text!';
  const newPromptReq = 'Crucial Zero-Drop Rule: You MUST map EVERY SINGLE WORD and SENTENCE from the script segment exactly into the scenes.\nCRITICAL QUALITY ASSURANCE OUTRIGHT REJECTION RULE: NEVER, EVER repeat a scene, a visual concept, or a script segment that you have already generated. Provide strict continuity! Deduplicate thoughts! (وكيل المراجعة المتشدد سيرفض أي مشهد مكرر)';
  code = code.replace(oldPromptReq, newPromptReq);
  
  fs.writeFileSync('src/lib/agents.ts', code);
  console.log('Successfully injected Reviewer Agent deduplication logic!');
} else {
  console.log('Target map not found. It might have been modified already.');
}
