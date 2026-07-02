import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const searchEffect = `
  useEffect(() => {
    if (finalVoiceScript) {
      const rawPoints = calculateTension(finalVoiceScript);
      const downsampled = downsampleTension(rawPoints, 50);
      setTensionPoints(downsampled);
    }
  }, [finalVoiceScript]);
`;

const replaceEffect = `
  const handleUpdateGraph = () => {
    if (finalVoiceScript) {
      const rawPoints = calculateTension(finalVoiceScript);
      const downsampled = downsampleTension(rawPoints, 50);
      setTensionPoints(downsampled);
    }
  };
`;
if (content.includes("useEffect(() => {\\n    if (finalVoiceScript) {")) {
  content = content.replace(searchEffect.trim(), replaceEffect.trim());
}

const searchHeatmap = `
  const renderTensionHeatmap = () => (
    <div className="flex gap-[1px] h-2 w-full">
      {tensionPoints.map((score, i) => (
        <div
          key={i}
          className={\`flex-1 \${score > 7 ? "bg-red-500" : score > 4 ? "bg-[#d4a574]" : "bg-[#111722]"}\`}
          title={\`Tension: \${score.toFixed(1)}\`}
        />
      ))}
    </div>
  );
`;

const replaceHeatmap = `
  const renderTensionHeatmap = () => (
    <div className="w-full flex items-center gap-4">
      <button onClick={handleUpdateGraph} className="text-[10px] bg-[#d4a574]/10 border border-[#d4a574]/40 text-[#d4a574] px-2 py-1 rounded cursor-pointer shrink-0">تحديث الغراف</button>
      <div className="flex gap-[1px] h-2 w-full flex-1">
        {tensionPoints.length > 0 ? tensionPoints.map((score, i) => (
          <div
            key={i}
            className={\`flex-1 \${score > 7 ? "bg-red-500" : score > 4 ? "bg-[#d4a574]" : "bg-[#111722]"}\`}
            title={\`Tension: \${score.toFixed(1)}\`}
          />
        )) : <div className="text-[10px] text-gray-500">جراف التوتر معلق للحفاظ على الذاكرة، اضغط تحديث</div>}
      </div>
    </div>
  );
`;
if (content.includes("renderTensionHeatmap")) {
  content = content.replace(searchHeatmap.trim(), replaceHeatmap.trim());
}

if (!content.includes('import { saveAs } from "file-saver";')) {
  // Try to find a good spot to insert
  content = content.replace('import { notify } from "../lib/notify";', 'import { notify } from "../lib/notify";\\nimport { saveAs } from "file-saver";');
}

const searchExport = /const handleDownloadDossierTxt = async \(\) => \{.+?notify\.classified\("تم التنزيل بنجاح!"\);\s*\};/s;

const replaceExport = `const handleDownloadDossierTxt = async () => {
    if (!data) return;
    setIsLoading(true);
    setStatus("جاري معالجة وتجميع المستند...");
    
    // Web Worker for building heavy strings
    const workerCode = \`
      self.onmessage = function(e) {
        const { data, fragmenterData, finalVoiceScript } = e.data;
        let content = "=========================================================\\\\n";
        content += " 📑 السكريبت الشامل والمتكامل لبرنامج برواز \\\\n";
        content += " العنوان: " + data.video_title + "\\\\n";
        content += "=========================================================\\\\n\\\\n";

        content += "[1] 💡 تفاصيل الصورة المصغرة (Thumbnail)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "- النص المقترح على الغلاف: " + (data.thumbnail?.text_on_image || "غير متوفر") + "\\\\n";
        if (data.publishing_kit?.thumbnail_concept) {
          content += "- وصف الغلاف للفريق البصري: " + data.publishing_kit.thumbnail_concept + "\\\\n";
        }
        content += "- توليد الخلفية (AI Image Prompt): \\\\n" + (data.thumbnail?.image_prompt || "لا يوجد") + "\\\\n\\\\n";

        content += "[2] 🚀 بيانات النشر (SEO & Publishing Kit)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "- عناوين مقترحة (يوتيوب/فيسبوك):\\\\n" + (data.publishing_kit?.youtube_titles || []).map((t) => "  * " + t).join("\\\\n") + "\\\\n\\\\n";
        content += "- الوصف (Description):\\\\n" + (data.publishing_kit?.description_al_daheeh_style || "") + "\\\\n\\\\n";
        content += "- الكلمات المفتاحية (Tags):\\\\n" + (data.publishing_kit?.tags || []).join(", ") + "\\\\n\\\\n";

        if (fragmenterData) {
          content += "[3] 📱 حزمة النشر للسوشيال ميديا (Fragmenter Kit)\\\\n";
          content += "-------------------------------------------------\\\\n";
          content += "* سردية ثريد إكس (X / Twitter Thread):\\\\n" + (fragmenterData.x_thread || []).join("\\\\n\\\\n") + "\\\\n\\\\n";
          content += "* خطاف تيك توك (TikTok Hook):\\\\n" + (fragmenterData.tiktok_hook || "") + "\\\\n\\\\n";
          content += "* كابشن انستجرام (Instagram Caption):\\\\n" + (fragmenterData.instagram_caption || "") + "\\\\n\\\\n";
        }

        if (data.shorts && data.shorts.length > 0) {
          content += "[4] 📱 مقترحات الريلز والشورتس (Shorts & Reels)\\\\n";
          content += "-------------------------------------------------\\\\n";
          data.shorts.forEach((short, i) => {
            content += "-- المقترح رقم " + (i + 1) + " --\\\\n";
            content += "* العنوان: " + short.title + "\\\\n";
            content += "* الخطاف (Hook): " + short.hook + "\\\\n";
            content += "* المحتوى (Body): " + short.body + "\\\\n";
            content += "* النداء (CTA): " + short.cta + "\\\\n";
            content += "* توجيهات بصرية: " + short.visual_instructions + "\\\\n\\\\n";
          });
        }

        if (data.sources && data.sources.length > 0) {
          content += "[5] 📚 المصادر والمراجع (Sources)\\\\n";
          content += "-------------------------------------------------\\\\n";
          data.sources.forEach((source) => {
            if (typeof source === 'string') {
              content += "* " + source + "\\\\n";
            } else {
              content += "* " + source.title + "\\\\n  الرابط: " + source.url + "\\\\n  تفاصيل: " + source.info + "\\\\n";
            }
          });
          content += "\\\\n";
        }

        content += "[6] 🎙️ النص الصوتي المجمع (النسخة النهائية للصوتيات)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += (finalVoiceScript || "لم يتم استخراج النص الصوتي.") + "\\\\n\\\\n";

        content += "[7] 🎬 تفاصيل المشاهد والأسكريبت الكامل للصورة (Scene by Scene)\\\\n";
        content += "-------------------------------------------------\\\\n\\\\n";
        const allScenes = [data.opening_sketch, ...(data.scenes || [])];
        allScenes.forEach((scene, index) => {
          if (!scene) return;
          content += "-- المشهد رقم [" + String(index).padStart(2, "0") + "] --\\\\n";
          if (scene.asset_id) content += "🔖 المرجع البصري: " + scene.asset_id + "\\\\n";
          if (scene.estimated_duration_seconds) content += "⏱️ المدة التقديرية: " + scene.estimated_duration_seconds + " ثانية\\\\n";
          if (scene.voice_over) content += "🎙️ التعليق الصوتي: " + scene.voice_over + "\\\\n";
          if (scene.visual_cue) content += "👁️ الرؤية البصرية: " + scene.visual_cue + "\\\\n";
          if (scene.montage_instructions) content += "✂️ توجيهات المونتاج: " + scene.montage_instructions + "\\\\n";
          if (scene.sound_design) content += "🎵 التصميم الصوتي: " + scene.sound_design + "\\\\n";
          if (scene.first_frame_image_prompt) content += "🎨 برومبت الصورة للذكاء الاصطناعي: \\\\n" + scene.first_frame_image_prompt + "\\\\n";
          content += "\\\\n";
        });

        self.postMessage(content);
      };
    \`;

    const blobUrl = URL.createObjectURL(new Blob([workerCode], { type: "application/javascript" }));
    const worker = new Worker(blobUrl);

    worker.onmessage = (e) => {
      const content = e.data;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      saveAs(blob, \`Barwaz_Dossier_\${data?.video_title?.replace(/\\s+/g, "_") || "script"}.txt\`);
      notify.classified("تم التنزيل بنجاح!");
      setIsLoading(false);
      setStatus("");
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    };

    worker.postMessage({ data, fragmenterData, finalVoiceScript });
  };`;

content = content.replace(searchExport, replaceExport);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log('Updated ContentCreationPage.tsx successfully');
