import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const correctFunctions = `
  const handleDownloadNote = async () => {
    if (!data) return;

    let content = \`# 📑 السكريبت الكامل لبرنامج برواز - حلقة: \${data.video_title}\\n\\n\`;
    content += \`*تم إنشاؤه عبر نظام تصنيع المحتوى الآلي*\\n\\n\`;
    content += \`---\\n\\n\`;

    content += \`## 💡 الصورة المصغرة (Thumbnail)\\n\`;
    content += \`- **النص المقترح على الغلاف:** \${data.thumbnail.text_on_image}\\n\`;
    content += \`- **وصف تصميم الغلاف للفريق البصري:** \${data.publishing_kit?.thumbnail_concept || ""}\\n\`;
    content += \`- **توليد الخلفية (AI Image Prompt):** \\n\\\`\\\`\\\`text\\n\${data.thumbnail.image_prompt}\\n\\\`\\\`\\\`\\n\\n\`;

    content += \`## 🚀 بيانات النشر (SEO & Publishing Kit)\\n\`;
    content += \`- **عناوين مقترحة (اختر الأقوى):**\\n\${(data.publishing_kit?.youtube_titles || []).map((t) => \`  - 🎬 \${t}\`).join("\\n")}\\n\\n\`;
    content += \`- **الوصف (Description):**\\n\${data.publishing_kit?.description_al_daheeh_style || ""}\\n\\n\`;
    content += \`- **الكلمات المفتاحية (Tags):**\\n\${(data.publishing_kit?.tags || []).join(", ")}\\n\\n\`;

    content += \`---\\n\\n\`;
    content += \`## 🎬 المشاهد والأسكريبت (Scene by Scene & Montage Instructions)\\n\\n\`;

    const allScenes = [data.opening_sketch, ...(data.scenes || [])];
    for (const [index, scene] of allScenes.entries()) {
      content += \`### 🎬 المشهد \${index === 0 ? "[00 - المقدمة والتمهيد]" : \`[0\${index}]\`}\\n\`;
      content += \`**🔖 Asset ID:** \\\`\${scene.asset_id}\\\`\\n\`;
      if (scene.estimated_duration_seconds) {
        content += \`**⏱️ المدة التقديرية:** \${scene.estimated_duration_seconds} ثانية\\n\`;
      } else {
        content += \`**⏱️ المدة التقديرية:** ~\${Math.ceil(((scene.voice_over?.length) || 100) / 15)} ثانية\\n\`;
      }
      content += \`\\n\`;

      content += \`#### 🎙️ التعليق الصوتي (Voiceover):\\n\`;
      content += \`> \${scene.voice_over}\\n\\n\`;

      content += \`#### 👁️ الرؤية البصرية وملحوظات المونتاج:\\n\`;
      if (scene.visual_cue) content += \`- **الشاشة/الكاميرا:** \${scene.visual_cue}\\n\`;
      if (scene.visual_motif) content += \`- **الموتيف البصري:** \${scene.visual_motif}\\n\`;
      if (scene.cinematic_movement) content += \`- **الحركة السينمائية:** \${scene.cinematic_movement}\\n\`;
      if (scene.montage_instructions) content += \`- **توجيهات المونتاج:** \${scene.montage_instructions}\\n\`;
      if (scene.sound_design) content += \`- **الهندسة الصوتية:** \${scene.sound_design}\\n\`;
      if (scene.asmr_soundscape) content += \`- **خلفية ASMR (Lyria 3):** \${scene.asmr_soundscape}\\n\`;
      content += \`\\n\\n\`;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, \`Barwaz_Script_\${data.video_title.replace(/\\s+/g, "_")}.md\`);
  };

  const handleGenerateAudioBatch = async () => {
    if (!data) return;
    setIsProcessingAudio(true);
    const elevenLabsKey = localStorage.getItem("elevenLabs_api_key");
    const elevenLabsVoiceId = localStorage.getItem("elevenLabs_voice_id") || "pNInz6obpgDQGcFmaJcg";
    if (!elevenLabsKey) {
        showToast("يرجى إدخال مفتاح ElevenLabs في الإعدادات", "error");
        setIsProcessingAudio(false);
        return;
    }

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const audioFolder = zip.folder("Voiceovers");
      const allScenes = [data.opening_sketch, ...(data.scenes || [])];
      let failCount = 0;

      for (const [index, scene] of allScenes.entries()) {
        let cleanText = scene.voice_over.replace(/\\[صمت درامي\\]/g, "... ");
        cleanText = cleanText.replace(/🔊/g, "");

        if (!cleanText.trim()) continue;

        try {
          const res = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${elevenLabsVoiceId}?output_format=mp3_44100_128\`, {
              method: "POST",
              headers: {
                 "Content-Type": "application/json",
                 "xi-api-key": elevenLabsKey
              },
              body: JSON.stringify({
                text: cleanText,
                model_id: "eleven_multilingual_v2"
              })
          });
          if (!res.ok) throw new Error("API Error");
          
          const blob = await res.blob();
          const fileName = \`Track_\${index.toString().padStart(2, '0')}_\${scene.asset_id.replace(/\\W+/g, "_")}.mp3\`;
          audioFolder?.file(fileName, blob);
        } catch (err) {
          console.error("Audio generation error:", err);
          failCount++;
        }
      }

      if (failCount === allScenes.length && allScenes.length > 0) {
        throw new Error("All audio requests failed.");
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, \`Barwaz_Audio_\${data.video_title.replace(/\\s+/g, "_")}.zip\`);
      showToast("تم تصدير الملفات الصوتية بنجاح");
    } catch (err: any) {
      console.error(err);
      showToast("فشلت معالجة الصوت", "error");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleDownloadVoiceScript = () => {
    const blob = new Blob([finalVoiceScript], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "final_voice_script.txt");
  };

  const handleExportZip = async () => {
    if (!data) return;
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(data.video_title.replace(/\\s+/g, "_"));
      folder?.file("script.txt", finalVoiceScript);
      folder?.file("metadata.json", JSON.stringify({
        title: data.video_title,
        mood,
        persona,
        timestamp: new Date().toISOString()
      }, null, 2));

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, \`Barwaz_Bundle_\${data.video_title.replace(/\\s+/g, "_")}.zip\`);
      showToast("تم تصدير الحزمة بنجاح");
    } catch (e) {
      showToast("فشل التصدير", "error");
    }
  };
`;

const startIndex = content.indexOf('const handleDownloadNote = async () => {');
const endIndex = content.indexOf('return (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + correctFunctions + '\n  ' + content.substring(endIndex);
  
  // Add activeTab state
  if (!content.includes('const [activeTab, setActiveTab]')) {
    content = content.replace(
      'const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);',
      'const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);\n  const [activeTab, setActiveTab] = useState<"script" | "kit" | "shorts">("script");'
    );
  }
  
  // Add SceneCard import
  if (!content.includes('import { SceneCard }')) {
    content = content.replace(
      'import { NarratorOptions } from "../lib/core";',
      'import { NarratorOptions } from "../lib/core";\nimport { SceneCard } from "../components/SceneCard";'
    );
  }

  // Ensure isProcessingAudio state exists
  if (!content.includes('const [isProcessingAudio, setIsProcessingAudio]')) {
    content = content.replace(
      'const [progress, setProgress] = useState(0);',
      'const [progress, setProgress] = useState(0);\n  const [isProcessingAudio, setIsProcessingAudio] = useState(false);'
    );
  }

  fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
  console.log('Functions corrected!');
} else {
  console.log('Could not find start or end index.');
}
