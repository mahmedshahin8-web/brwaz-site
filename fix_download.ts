import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf-8');

const startStr = "const handleDownloadDossierTxt = async () => {";
const endStr = 'URL.revokeObjectURL(blobUrl);\n    };\n\n    worker.postMessage({ data, fragmenterData, finalVoiceScript });\n  };';

const startIdx = content.indexOf(startStr);
const endIdx = content.lastIndexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const head = content.substring(0, startIdx);
    const tail = content.substring(endIdx + endStr.length);
    
    // We append the clean function:
    const cleanFn = `  const handleDownloadDossierTxt = async () => {
    if (!data) return;
    setIsLoading(true);
    setStatus("جاري معالجة وتجميع المستند...");
    
    // Web Worker for building heavy strings
    const workerCode = \`
      self.onmessage = function(e) {
        const { data, fragmenterData, finalVoiceScript } = e.data;
        const creationDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        
        let content = "=========================================================\\\\n";
        content += " 📜 الوثيقة الإنتاجية الشاملة (PRODUCTION DOSSIER) \\\\n";
        content += "=========================================================\\\\n\\\\n";
        
        content += "[معلومات الحلقة / EPISODE METADATA]\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "🎬 العنوان الرئيسي : " + data.video_title + "\\\\n";
        content += "🎭 الحالة المزاجية : " + (data.mood || "غير محدد") + "\\\\n";
        content += "📅 تاريخ الإنتاج : " + creationDate + "\\\\n";
        content += "📂 حالة الملف : جاهز للتنفيذ (Approved for Production)\\\\n\\\\n";

        content += "[التوجه البصري الفني / VISUAL DNA & ART DIRECTION]\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "يهدف هذا التوجه لتوحيد الصورة البصرية للحلقة بالكامل.\\\\n";
        content += "🎨 النمط الفني : " + (data.mood ? "أسلوب " + data.mood : "مختلط") + " - يميل للواقعية مع لمسات فنية.\\\\n";
        if (data.omnichannel?.visual_dna) {
           content += "🖌️ الإرشادات العامة : " + data.omnichannel.visual_dna + "\\\\n";
        } else {
           content += "🖌️ الإرشادات العامة : تجنب الوجوه البشرية المباشرة ما لم تكن شخصية تاريخية صريحة. الاعتماد على الظلال، التباين العالي (Chiaroscuro)، إضاءة درامية.\\\\n";
        }
        content += "\\\\n";

        content += "[1] 💡 تفاصيل الصورة المصغرة (THUMBNAIL BLUEPRINT)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "📌 النص المقترح : " + (data.thumbnail?.text_on_image || "غير متوفر") + "\\\\n";
        if (data.thumbnail_blueprint?.mood_color_instructions) {
          content += "🎨 الألوان الأساسية : " + data.thumbnail_blueprint.mood_color_instructions + "\\\\n";
        }
        if (data.publishing_kit?.thumbnail_concept) {
          content += "👁️ وصف الغلاف للمصمم : " + data.publishing_kit.thumbnail_concept + "\\\\n";
        }
        content += "🤖 موجه الذكاء الاصطناعي (Prompt) : \\\\n" + (data.thumbnail?.image_prompt || "لا يوجد") + "\\\\n\\\\n";

        content += "[2] 🚀 بيانات النشر (SEO & PUBLISHING KIT)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "🎯 عناوين مقترحة (YouTube/Facebook):\\\\n" + (data.publishing_kit?.youtube_titles || []).map((t) => "  " + String.fromCharCode(8226) + " " + t).join("\\\\n") + "\\\\n\\\\n";
        content += "📝 الوصف (Description):\\\\n" + (data.publishing_kit?.description_al_daheeh_style || "") + "\\\\n\\\\n";
        content += "🔑 الكلمات المفتاحية (Tags):\\\\n" + (data.publishing_kit?.tags || []).join(", ") + "\\\\n\\\\n";

        if (fragmenterData) {
          content += "[3] 📱 حزمة النشر للسوشيال ميديا (FRAGMENTER KIT)\\\\n";
          content += "-------------------------------------------------\\\\n";
          content += "🐦 سردية ثريد إكس (X / Twitter Thread):\\\\n" + (fragmenterData.x_thread || []).join("\\\\n\\\\n") + "\\\\n\\\\n";
          content += "🎵 خطاف تيك توك (TikTok Hook):\\\\n" + (fragmenterData.tiktok_hook || "") + "\\\\n\\\\n";
          content += "📸 كابشن انستجرام (Instagram Caption):\\\\n" + (fragmenterData.instagram_caption || "") + "\\\\n\\\\n";
        }

        if (data.shorts && data.shorts.length > 0) {
          content += "[4] 📱 مقترحات الريلز والشورتس (SHORTS & REELS)\\\\n";
          content += "-------------------------------------------------\\\\n";
          data.shorts.forEach((short, i) => {
            content += "== المقترح رقم (" + (i + 1) + ") ==\\\\n";
            content += "📌 العنوان: " + short.title + "\\\\n";
            content += "🎣 الخطاف (Hook): " + short.hook + "\\\\n";
            content += "📖 المحتوى (Body): " + short.body + "\\\\n";
            content += "📢 النداء (CTA): " + short.cta + "\\\\n";
            content += "👁️ توجيهات بصرية: " + short.visual_instructions + "\\\\n\\\\n";
          });
        }

        if (data.sources && data.sources.length > 0) {
          content += "[5] 📚 المصادر والمراجع (ACADEMIC SOURCES)\\\\n";
          content += "-------------------------------------------------\\\\n";
          data.sources.forEach((source) => {
            if (typeof source === 'string') {
              content += "  " + String.fromCharCode(8226) + " " + source + "\\\\n";
            } else {
              content += "  " + String.fromCharCode(8226) + " " + source.title + "\\\\n    الرابط: " + source.url + "\\\\n    تفاصيل: " + source.info + "\\\\n";
            }
          });
          content += "\\\\n";
        }

        content += "[6] 🎙️ النص الصوتي المجمع (MASTER VOICEOVER SCRIPT)\\\\n";
        content += "-------------------------------------------------\\\\n";
        content += "هذا النص مصمم للتسجيل المباشر. يراعى الوقفات (صمت درامي) والانفعالات المطلوبة.\\\\n\\\\n";
        content += (finalVoiceScript || "لم يتم استخراج النص الصوتي.") + "\\\\n\\\\n";

        content += "[7] 🎬 تفاصيل المشاهد والأسكريبت الكامل للإخراج (DIRECTOR'S SCENE-BY-SCENE)\\\\n";
        content += "-------------------------------------------------\\\\n\\\\n";
        const allScenes = [data.opening_sketch, ...(data.scenes || [])];
        allScenes.forEach((scene, index) => {
          if (!scene) return;
          content += "=========================================================\\\\n";
          content += " 📍 المشهد رقم [" + String(index).padStart(2, "0") + "] ";
          if (scene.asset_id) content += "| " + scene.asset_id;
          content += "\\\\n=========================================================\\\\n";
          
          if (scene.estimated_duration_seconds) content += "⏱️ المدة التقديرية: " + scene.estimated_duration_seconds + " ثانية\\\\n\\\\n";
          
          if (scene.voice_over) {
             content += "🎙️ التعليق الصوتي:\\\\n";
             content += "   " + scene.voice_over + "\\\\n\\\\n";
          }
          if (scene.visual_cue) {
             content += "👁️ الرؤية البصرية:\\\\n";
             content += "   " + scene.visual_cue + "\\\\n\\\\n";
          }
          if (scene.b_roll_search_query || scene.b_roll_keywords) {
             content += "🎞️ لقطات مخزون B-Roll (كلمات بحث):\\\\n";
             content += "   " + (scene.b_roll_search_query || scene.b_roll_keywords) + "\\\\n\\\\n";
          }
          if (scene.montage_instructions) {
             content += "✂️ توجيهات المونتاج:\\\\n";
             content += "   " + scene.montage_instructions + "\\\\n\\\\n";
          }
          if (scene.sound_design || scene.sfx) {
             content += "🎵 التصميم الصوتي والمؤثرات (SFX):\\\\n";
             content += "   " + (scene.sound_design || scene.sfx) + "\\\\n\\\\n";
          }
          if (scene.multi_camera_angles && scene.multi_camera_angles.length > 0) {
             content += "🎥 زوايا الكاميرا المقترحة:\\\\n";
             scene.multi_camera_angles.forEach(angle => {
                content += "   - " + (angle.type || "") + ": " + (angle.description || "") + (angle.lens ? " (Lens: " + angle.lens + ")" : "") + "\\\\n";
             });
             content += "\\\\n";
          }
          
          // Image / Video Generation Prompts
          const hasImagePrompts = scene.first_frame_image_prompt || scene.second_frame_image_prompt || scene.image_prompt || scene.ai_video_prompt;
          if (hasImagePrompts) {
             content += "🤖 موجّهات الذكاء الاصطناعي (AI GENERATION PROMPTS):\\\\n";
             if (scene.first_frame_image_prompt) {
                content += "   🎨 توليد صورة (الفريم الأول): \\\\n     " + scene.first_frame_image_prompt + "\\\\n";
             }
             if (scene.first_frame_motion_prompt) {
                content += "   🎥 تحريك الحركة (الفريم الأول - Kling/Runway): \\\\n     " + scene.first_frame_motion_prompt + "\\\\n";
             }
             if (scene.second_frame_image_prompt) {
                content += "   🎨 توليد صورة (الفريم الثاني): \\\\n     " + scene.second_frame_image_prompt + "\\\\n";
             }
             if (scene.second_frame_motion_prompt) {
                content += "   🎥 تحريك الحركة (الفريم الثاني - Kling/Runway): \\\\n     " + scene.second_frame_motion_prompt + "\\\\n";
             }
             if (!scene.first_frame_image_prompt && scene.image_prompt) {
                content += "   🎨 توليد صورة: \\\\n     " + scene.image_prompt + "\\\\n";
             }
             if (!scene.first_frame_motion_prompt && scene.ai_video_prompt) {
                content += "   🎥 تحريك فيديو: \\\\n     " + scene.ai_video_prompt + "\\\\n";
             }
             content += "\\\\n";
          }
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
      saveAs(blob, \`Barwaz_Production_Dossier_\${data?.video_title?.replace(/\\\\s+/g, "_") || "script"}.txt\`);
      notify.classified("تم التنزيل بنجاح!");
      setIsLoading(false);
      setStatus("");
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    };

    worker.postMessage({ data, fragmenterData, finalVoiceScript });
  };`;
    
    fs.writeFileSync('src/pages/ContentCreationPage.tsx', head + cleanFn + tail);
    console.log("Successfully fixed the file.");
} else {
    console.log("Could not find boundaries.");
}
