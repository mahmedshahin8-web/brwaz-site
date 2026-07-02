import fs from 'fs';

let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');
const startIdx = lines.findIndex(l => l.includes('const handleDownloadNote = () => {'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('const fetchArchive = '));

if (startIdx !== -1 && endIdx !== -1) {
  let content = fs.readFileSync('src/App.tsx', 'utf-8');
  let before = lines.slice(0, startIdx).join('\n') + '\n';
  let after = lines.slice(endIdx).join('\n');
  
  let newCode = "  const handleDownloadNote = () => {\n" +
"    if (!data) return;\n" +
"    \n" +
"    let content = `# 📑 السكريبت الكامل لبرنامج برواز - حلقة: ${data.video_title}\\n\\n`;\n" +
"    content += `*تم إنشاؤه عبر نظام تصنيع المحتوى الآلي*\\n\\n`;\n" +
"    content += `---\\n\\n`;\n" +
"    \n" +
"    content += `## 💡 الصورة المصغرة (Thumbnail)\\n`;\n" +
"    content += `- **النص المقترح على الغلاف:** ${data.thumbnail.text_on_image}\\n`;\n" +
"    content += `- **وصف تصميم الغلاف للفريق البصري:** ${data.publishing_kit?.thumbnail_concept || ''}\\n`;\n" +
"    content += `- **توليد الخلفية (AI Image Prompt):** \\n\\\`\\\`\\\`text\\n${data.thumbnail.image_prompt}\\n\\\`\\\`\\\`\\n\\n`;\n" +
"\n" +
"    content += `## 🚀 بيانات النشر (SEO & Publishing Kit)\\n`;\n" +
"    content += `- **عناوين مقترحة (اختر الأقوى):**\\n${(data.publishing_kit?.youtube_titles || []).map(t => `  - 🎬 ${t}`).join('\\n')}\\n\\n`;\n" +
"    content += `- **الوصف (Description):**\\n${data.publishing_kit?.description_al_daheeh_style || ''}\\n\\n`;\n" +
"    content += `- **الكلمات المفتاحية (Tags):**\\n${(data.publishing_kit?.tags || []).join(', ')}\\n\\n`;\n" +
"\n" +
"    content += `---\\n\\n`;\n" +
"    content += `## 🎬 المشاهد والأسكريبت (Scene by Scene & Montage Instructions)\\n\\n`;\n" +
"\n" +
"    const allScenes = [data.opening_sketch, ...data.scenes];\n" +
"    allScenes.forEach((scene, index) => {\n" +
"      content += `### 🎬 المشهد ${index === 0 ? '[00 - المقدمة والتمهيد]' : `[0${index}]`}\\n`;\n" +
"      content += `**🔖 Asset ID:** \\`${scene.asset_id}\\`\\n\\n`;\n" +
"      \n" +
"      content += `#### 🎙️ التعليق الصوتي (Voiceover):\\n`;\n" +
"      content += `> ${scene.voice_over}\\n\\n`;\n" +
"      \n" +
"      content += `#### 👁️ الرؤية البصرية وملحوظات المونتاج:\\n`;\n" +
"      if (scene.visual_cue) content += `- **الشاشة/الكاميرا:** ${scene.visual_cue}\\n`;\n" +
"      if (scene.montage_instructions) content += `- **توجيهات المونتاج:** ${scene.montage_instructions}\\n`;\n" +
"      \n" +
"      content += `#### 🎨 التصميمات والبرومبتات:\\n`;\n" +
"      if (scene.image_prompt_midjourney) content += `- **Midjourney:** \\`${scene.image_prompt_midjourney}\\`\\n`;\n" +
"      if (scene.ai_video_prompt) content += `- **Runway/Kling:** \\`${scene.ai_video_prompt}\\`\\n`;\n" +
"      if (scene.b_roll_keywords) content += `- **B-Roll Keywords:** \\`${scene.b_roll_keywords}\\`\\n`;\n" +
"      \n" +
"      content += `\\n--------------------------------------------------\\n\\n`;\n" +
"    });\n" +
"\n" +
"    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });\n" +
"    const url = URL.createObjectURL(blob);\n" +
"    const a = document.createElement('a');\n" +
"    a.href = url;\n" +
"    a.download = `Barwaz_Script_${data.video_title.replace(/\\s+/g, '_')}.txt`;\n" +
"    a.click();\n" +
"    URL.revokeObjectURL(url);\n" +
"    showToast('تم تحميل السكريبت بنجاح!');\n" +
"  };\n" +
"\n" +
"  const handleDownloadVisuals = () => {\n" +
"    if (!data) return;\n" +
"    \n" +
"    let content = `# 🎨 أوامر التصميم البصري - حلقة: ${data.video_title}\\n\\n`;\n" +
"    content += `*خاص بفريق الجرافيك والموشن*\\n\\n`;\n" +
"    content += `---\\n\\n`;\n" +
"\n" +
"    const allScenes = [data.opening_sketch, ...data.scenes];\n" +
"    allScenes.forEach((scene, index) => {\n" +
"      if (!scene.image_prompt_midjourney && !scene.ai_video_prompt && !scene.visual_cue) return;\n" +
"      \n" +
"      content += `### 🎬 المشهد ${index === 0 ? '[00 - المقدمة والتمهيد]' : `[0${index}]`}\\n`;\n" +
"      content += `**🔖 Asset ID:** \\`${scene.asset_id}\\`\\n\\n`;\n" +
"\n" +
"      if (scene.visual_cue) {\n" +
"        content += `👁️ المشهد (Visual Cue):\\n`;\n" +
"        content += `${scene.visual_cue}\\n\\n`;\n" +
"      }\n" +
"      if (scene.image_prompt_midjourney) {\n" +
"        content += `🎨 برومبت الصورة (Nano Banana / DALL-E / LM Arena):\\n`;\n" +
"        content += `${scene.image_prompt_midjourney}\\n\\n`;\n" +
"      }\n" +
"      if (scene.ai_video_prompt) {\n" +
"        content += `🎬 برومبت التحريك (Runway/Luma):\\n`;\n" +
"        content += `${scene.ai_video_prompt}\\n\\n`;\n" +
"      }\n" +
"      if (scene.montage_instructions) {\n" +
"        content += `✂️ ملاحظات المونتاج:\\n`;\n" +
"        content += `${scene.montage_instructions}\\n\\n`;\n" +
"      }\n" +
"      content += `--------------------------------------------------\\n\\n`;\n" +
"    });\n" +
"\n" +
"    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });\n" +
"    const url = URL.createObjectURL(blob);\n" +
"    const a = document.createElement('a');\n" +
"    a.href = url;\n" +
"    a.download = `Barwaz_Visuals_${data.video_title.replace(/\\s+/g, '_')}.txt`;\n" +
"    a.click();\n" +
"    URL.revokeObjectURL(url);\n" +
"    showToast('تم تحميل أوامر التصميم بنجاح!');\n" +
"  };\n";
  fs.writeFileSync('src/App.tsx', before + newCode + after);
}
