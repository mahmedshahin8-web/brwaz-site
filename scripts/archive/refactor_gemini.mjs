import fs from 'fs';

let gemini = fs.readFileSync('src/lib/gemini.ts', 'utf8');

gemini = gemini.replace(
  /const \{ executeAgent1_Scriptwriter, executeAgent2_Director, executeAgent3_ArtDirector, executeAgent4_Reviewer \} = await import\('\.\/agents'\);/,
  "const { executeAgent1_Scriptwriter, executeAgent2_Director, executeAgent3_ArtDirector, executeAgent4_Reviewer, executeAgent5_Publisher } = await import('./agents');"
);

gemini = gemini.replace(
  /onProgress\?\.\(90, "\[!\] غرفة التحميض المظلمة: يتم تغليف الملف واسترجاع أدلة مسربة \(Shorts\)\.\.\."\);\s*const packaging = await generatePackaging\(\s*design\.video_title,\s*design\.research_data,\s*allScenes,\s*engineNode1,\s*onChunk\s*\);\s*const processedShorts = \(packaging\.shorts \|\| \[\]\)\.map\(\(s: any\) => \(\{\s*\.\.\.s,\s*visual_instructions: applyGlobalStyle\(s\.visual_instructions \|\| ""\),\s*\}\)\);/,
  `onProgress?.(90, "[!] وكيل النشر SEO Agent: يتم إنشاء باقة النشر على يوتيوب واستخراج المصادر...");
  const publishingKitRaw = await executeAgent5_Publisher(
    design.video_title,
    design.research_data,
    mood,
    persona,
    engineNode1,
    onChunk
  );

  // Mechanical Injection of Sources
  let finalDescription = publishingKitRaw.description + "\\n\\n---\\n\\nالمصادر والمراجع الأساسية:\\n";
  dossier.sources.forEach((s, idx) => {
    finalDescription += \`\${idx + 1}. \${s.title}\\n\${s.url} - \${s.key_takeaway}\\n\`;
  });

  const publishing_kit = {
    ...publishingKitRaw,
    description: finalDescription
  };
`
);

gemini = gemini.replace(
  /publishing_kit: packaging\.packaging,\s*shorts: processedShorts,/,
  `publishing_kit: publishing_kit,\n    shorts: [],`
);

fs.writeFileSync('src/lib/gemini.ts', gemini);
console.log('modified orchestrator for publisher');
