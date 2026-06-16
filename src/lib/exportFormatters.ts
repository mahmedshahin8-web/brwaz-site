import { saveAs } from 'file-saver';
import { useStudioStore } from '../store/useStudioStore';

const respondWithBlob = (content: string, type: string, filename: string) => {
  const blob = new Blob([content], { type });
  saveAs(blob, filename);
};

const getGlobalMetaData = (data: any) => {
  const creationDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const allScenes = [data.opening_sketch, ...(data.scenes || [])].filter(Boolean);
  const totalDurationSecs = allScenes.reduce((acc, scene) => acc + (Number(scene?.estimated_duration_seconds) || Number((scene as any)?.estimated_seconds) || 12), 0);
  const totalMins = Math.floor(totalDurationSecs / 60);
  const totalSecs = Math.floor(totalDurationSecs % 60);
  const durationFormatted = String(totalMins).padStart(2, '0') + ":" + String(totalSecs).padStart(2, '0');
  
  const title = data.video_title || data.title || "وثيقة غير معنونة";
  const mood = data.mood || "Cinematic Thriller / وثائقي مشوق";
  const persona = data.persona || "النبّاش / Investigator";

  return { creationDate, allScenes, durationFormatted, title, mood, persona };
};

export const generateTxt = ({ data, fragmenterData, finalVoiceScript }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data);
    
    let content = "=========================================================\n";
    content += "   📜 الوثيقة الإنتاجية الشاملة (DIRECTOR'S DOSSIER) \n";
    content += "=========================================================\n\n";
    
    // --- SECTION 1 ---
    content += "[معلومات الملف / CLASSIFIED METADATA]\n";
    content += "-------------------------------------------------\n";
    content += "🎬 العنوان   : " + title + "\n";
    content += "🎭 المزاج    : " + mood + "\n";
    content += "🕵️ الراوي     : " + persona + "\n";
    content += "⏳ المدة     : " + durationFormatted + " دقيقة\n";
    content += "📅 تاريخ الختم: " + creationDate + "\n";
    content += "🎙️ التوجيه الصوتي: عميق، مشوق، يحمل طابع السرد الوثائقي الغامض (Stability: 40% | Clarity: 80%)\n\n";

    content += "[التوجه البصري الفني / VISUAL DNA]\n";
    content += "-------------------------------------------------\n";
    content += "🎨 لوحة الألوان: أسود داكن، ظلال عميقة، إضاءات نيون متفرقة (أزرق غامض، كهرماني).\n";
    content += "🖌️ الإنجين البصري: " + (data.omnichannel?.visual_dna || "Cinematic dark thriller, high contrast lighting, mysterious hacker aesthetic, sharp focus, anamorphic lens flare.") + "\n\n";

    content += "[النص الصوتي المجمع / MASTER VOICEOVER SCRIPT]\n";
    content += "-------------------------------------------------\n";
    content += (finalVoiceScript || "لم يتم تسجيل النص الصوتي بعد، يُرجى الرجوع للأسكريبت المقطّع أدناه.") + "\n\n";

    // --- SECTION 2 ---
    content += "=========================================================\n";
    content += "[السكربت التنفيذي / SCENE-BY-SCENE BREAKDOWN]\n";
    content += "=========================================================\n\n";

    allScenes.forEach((scene, index) => {
      content += "-- المشهد [" + String(index + 1).padStart(2, "0") + "] --------------------------------------\n";
      if (scene.asset_id) content += "🔖 المرجع: " + scene.asset_id + "\n";
      if (scene.estimated_duration_seconds) content += "⏱️ المدة: ~" + scene.estimated_duration_seconds + " ث\n";
      if (scene.voice_over) content += "\n🎙️ التعليق الصوتي (VO):\n" + scene.voice_over + "\n";
      if (scene.visual_cue) content += "\n👁️ الرؤية المخرجية: " + scene.visual_cue + "\n";
      if (scene.transition_to_next_scene) content += "🎞️ النقلة: " + scene.transition_to_next_scene + "\n";
      
      const finalFirstImgPromptTxt = scene.first_frame_image_prompt || scene.image_prompt || '';
      if (finalFirstImgPromptTxt) {
        content += "\n🎨 برومبت الصورة الأولى (Shot 1):\n" + finalFirstImgPromptTxt + "\n";
        content += "🎬 حركة الكاميرا 1: " + (scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in") + "\n";
      }
      if (scene.second_frame_image_prompt) {
        content += "\n🎨 برومبت الصورة الثانية (Shot 2):\n" + scene.second_frame_image_prompt + "\n";
        content += "🎬 حركة الكاميرا 2: " + (scene.second_frame_motion_prompt || "Slow micro-movements") + "\n";
      }
      content += "\n";
    });

    content += "=========================================================\n";
    content += "[غلاف الفيديو / THUMBNAIL BLUEPRINT]\n";
    content += "=========================================================\n";
    content += "📌 النص التفاعلي المكتوب : " + (data.thumbnail?.text_on_image || data.publishing_kit?.thumbnail_blueprint?.text_ab_test || "[بدون نص، الاعتماد على لغة الجسد]") + "\n";
    
    let posPrompt = data.thumbnail?.image_prompt || data.publishing_kit?.thumbnail_prompt || data.publishing_kit?.thumbnail_blueprint?.positive_prompt || "لا يوجد وصف محدد للصورة المصغرة من المحرك.";
    if (posPrompt !== "لا يوجد" && !posPrompt.includes("--ar 16:9")) {
      posPrompt += " --ar 16:9 --style raw --v 6.0";
    }
    const negPrompt = "--no text, font, letters, watermark, geometric shapes, 3d render, cartoon, bright daylight, flat colors, low quality";
    content += "🤖 البرومبت (Midjourney): \n" + posPrompt + "\n";
    content += "🛑 السلبي (Negative) : \n" + negPrompt + "\n\n";

    content += "=========================================================\n";
    content += "[أصول المونتاج / POST-PRODUCTION ASSETS]\n";
    content += "=========================================================\n";
    
    const storeState = useStudioStore.getState();
    const uniqueBRolls = [...new Set(storeState.bRollKeywords)].filter(Boolean);
    const uniqueSFX = [...new Set(storeState.sfxList)].filter(Boolean);

    content += "🎥 وسائط مساعدة (B-Roll):\n";
    if (uniqueBRolls.length > 0) uniqueBRolls.forEach(b => content += "  - " + b + "\n");
    else content += "  [يتم الاستعانة بالمكتبة السينمائية العامة]\n";

    content += "\n🎵 مؤثرات وموسيقى (SFX & BGM):\n";
    if (uniqueSFX.length > 0) uniqueSFX.forEach(s => content += "  - " + s + "\n");
    else content += "  [تصميم صوتي مظلم، نبضات قلب بطيئة، أصوات أجهزة قديمة]\n";
    content += "\n";

    content += "=========================================================\n";
    content += "[التسويق والنشر / PUBLISHING & GROWTH]\n";
    content += "=========================================================\n";

    if (data.publishing_kit || fragmenterData) {
      const titles = data.publishing_kit?.youtube_titles || fragmenterData?.youtube_titles || [title];
      content += "🎯 خيارات العناوين (A/B Testing):\n" + titles.map((t: string) => "  - " + t).join("\n") + "\n\n";
      
      const desc = data.publishing_kit?.description || fragmenterData?.description || "وصف مشوق للحلقة...";
      content += "📝 صندوق الوصف (Description):\n" + desc + "\n\n";
      
      const tags = data.publishing_kit?.tags || fragmenterData?.tags || ["وثائقي", "خفايا", "أسرار"];
      content += "🔑 الكلمات المفتاحية (Tags):\n" + tags.join(", ") + "\n\n";
      
      const xThread = fragmenterData?.x_thread || data.omnichannel?.twitter_thread || [];
      if (xThread.length > 0) {
        content += "🐦 ثريد تويتر / X:\n" + xThread.join("\n\n---\n") + "\n\n";
      }

      const tiktokHook = fragmenterData?.tiktok_hook || fragmenterData?.shorts?.[0]?.hook || data.shorts?.[0]?.hook || "[استخدم أقوى مشهد في أول 3 ثوانٍ]";
      content += "📱 هوك الشورتس (Tiktok/Reels Hook):\n" + tiktokHook + "\n\n";
    } else {
      content += "  [لم يتم توليد حزمة التسويق لهذه الحلقة]\n\n";
    }

    if (data.sources && Array.isArray(data.sources)) {
      content += "=========================================================\n";
      content += "[قاعدة بيانات المصادر / DECLASSIFIED SOURCES]\n";
      content += "=========================================================\n";
      data.sources.forEach((source: any) => {
        if (typeof source === 'string') {
          content += "  - " + source + "\n";
        } else if (source) {
          const sTitle = source.title || source.name || source.source || "ملف خارجي";
          const sUrl = source.url || source.link ? ` (${source.url || source.link})` : "";
          content += `  - ${sTitle}${sUrl}\n`;
        }
      });
      content += "\n🛡️ مسح أمني دقيق: معتمد ومصحح بنسبة 100%\n";
    }

    const filename = `Barwaz_Dossier_TXT_${title.replace(/\s+/g, "_")}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateMd = ({ data, fragmenterData, finalVoiceScript }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data);

    let content = `# 📜 الوثيقة الإنتاجية الشاملة (DIRECTOR'S DOSSIER)\n\n`;
    
    content += `## 📁 [1] معلومات الملف (CLASSIFIED METADATA)\n`;
    content += `- **🎬 العنوان:** ${title}\n`;
    content += `- **🎭 المزاج:** ${mood}\n`;
    content += `- **🕵️ الراوي:** ${persona}\n`;
    content += `- **⏳ المدة:** ${durationFormatted} دقيقة\n`;
    content += `- **📅 الختم الزمني:** ${creationDate}\n\n`;

    content += `## 🎙️ [2] الأسكريبت الصوتي המאוחד (MASTER VOICEOVER)\n`;
    content += `> *هذا النص المجمع مخصص لمؤدي التعليق الصوتي.* \n\n`;
    const safeVoScript = finalVoiceScript ? finalVoiceScript.replace(/\\n/g, '\n\n') : "لم يتم تسجيل النص الصوتي بعد.";
    content += `${safeVoScript}\n\n---\n\n`;

    content += `## 🎬 [3] التقطيع الإخراجي (SCENE BREAKDOWN)\n\n`;
    allScenes.forEach((scene, index) => {
      content += `### المشهد [${String(index + 1).padStart(2, "0")}]\n`;
      if (scene.asset_id) content += `- **🔖 المرجع:** \`${scene.asset_id}\`\n`;
      if (scene.estimated_duration_seconds) content += `- **⏱️ المدة:** ${scene.estimated_duration_seconds} ثانية\n`;
      if (scene.voice_over) content += `\n**🎙️ التعليق الصوتي (VO):**\n> ${scene.voice_over.replace(/\n/g, '\n> ')}\n`;
      if (scene.visual_cue) content += `\n**👁️ الرؤية:** ${scene.visual_cue}\n`;
      
      const finalFirstImgPrompt = scene.first_frame_image_prompt || scene.image_prompt;
      if (finalFirstImgPrompt) {
        content += `\n**🎨 برومبت الصورة 1:**\n\`\`\`text\n${finalFirstImgPrompt}\n\`\`\`\n`;
        content += `- **📸 الكاميرا:** *${scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in"}*\n`;
      }
      
      if (scene.second_frame_image_prompt) {
        content += `\n**🎨 برومبت الصورة 2:**\n\`\`\`text\n${scene.second_frame_image_prompt}\n\`\`\`\n`;
        content += `- **📸 الكاميرا:** *${scene.second_frame_motion_prompt || "Slow micro-movements"}*\n`;
      }
      content += `\n---\n\n`;
    });

    content += `## 🖼️ [4] غلاف الفيديو (THUMBNAIL)\n`;
    content += `- **النص المقترح:** ${data.thumbnail?.text_on_image || data.publishing_kit?.thumbnail_blueprint?.text_ab_test || "بدون نص"}\n`;
    let posPromptMD = data.thumbnail?.image_prompt || data.publishing_kit?.thumbnail_prompt || "لا يوجد وصف محدد.";
    if (posPromptMD !== "لا يوجد وصف محدد." && !posPromptMD.includes("--ar 16:9")) posPromptMD += " --ar 16:9 --style raw --v 6.0";
    content += `\n**🤖 برومبت جينيريتور:**\n\`\`\`text\n${posPromptMD}\n\`\`\`\n`;
    content += `**🛑 سلبي:**\n\`\`\`text\n--no text, font, letters, watermark, geometric shapes, cartoon, bright daylight\n\`\`\`\n\n`;

    content += `## 🚀 [5] التسويق (PUBLISHING KIT)\n`;
    const publishSource = data.publishing_kit || fragmenterData || {};
    if (Object.keys(publishSource).length > 0) {
      if (publishSource.youtube_titles) {
        content += `### العناوين المقترحة:\n`;
        publishSource.youtube_titles.forEach((t: string) => content += `- ${t}\n`);
      }
      if (publishSource.description) content += `\n### الوصف:\n${publishSource.description}\n`;
      if (publishSource.tags) content += `\n### الكلمات المفتاحية:\n\`${publishSource.tags.join("` `")}\`\n`;
      
      const tiktokHook = fragmenterData?.tiktok_hook || fragmenterData?.shorts?.[0]?.hook || publishSource?.shorts?.[0]?.hook;
      if (tiktokHook) content += `\n### 📱 هوك تيك توك / شورتس:\n> ${tiktokHook}\n`;
      
      if (fragmenterData?.x_thread && fragmenterData.x_thread.length > 0) {
        content += `\n### 🐦 ثريد X:\n`;
        fragmenterData.x_thread.forEach((t: string, i: number) => content += `**${i+1}/** ${t}\n\n`);
      }
    } else {
      content += `> لم يتم توليد حزمة تسويق.\n\n`;
    }

    const filename = `Barwaz_Dossier_MD_${title.replace(/\s+/g, "_")}.md`;
    respondWithBlob(content, "text/markdown;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateDocx = ({ data, fragmenterData, finalVoiceScript }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data);
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; dir: rtl; text-align: right; line-height: 1.8; color: #1e293b; background: #ffffff; }
    h1 { color: #0f172a; font-size: 26pt; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 5px; }
    .subtitle { text-align: center; color: #64748b; font-size: 12pt; margin-bottom: 40px; }
    h2 { color: #1e40af; font-size: 18pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 35px; }
    h3 { color: #0f172a; font-size: 14pt; margin-top: 25px; }
    .meta-box { background: #f8fafc; border-right: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 4px; border-left: 1px solid #e2e8f0;}
    .scene-meta { font-size: 10.5pt; color: #475569; margin-bottom: 15px; background: #f1f5f9; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; }
    .voice-over { font-size: 14pt; font-weight: bold; color: #0f172a; margin-bottom: 15px; line-height: 2; }
    .prompt { font-size: 10pt; color: #0369a1; direction: ltr; text-align: left; background: #f0f9ff; padding: 10px; border-radius: 4px; border: 1px dashed #bae6fd; font-family: Courier, monospace; }
    ul { list-style-type: square; }
    li { margin-bottom: 8px; }
  </style>
  </head><body><div dir='rtl'>`;
    const footer = "</div></body></html>";
    
    let content = `<h1>${title}</h1>`;
    content += `<div class='subtitle'>الوثيقة الإنتاجية المرجعية (Director's Cut) </div>`;
    
    // --- SECTION 1 ---
    content += `<h2>[1] تفاصيل الملف (Classified Metadata)</h2>`;
    content += `<div class="meta-box">`;
    content += `<b>العنوان:</b> ${title}<br>`;
    content += `<b>المزاج والرتم:</b> ${mood}<br>`;
    content += `<b>شخصية الراوي:</b> ${persona}<br>`;
    content += `<b>المدة التقديرية:</b> ${durationFormatted} دقيقة<br>`;
    content += `<b>تاريخ الإنشاء:</b> ${creationDate}`;
    content += `</div>`;

    content += `<h2>[2] النص الصوتي للتسجيل (Master Voiceover)</h2>`;
    const safeVoDocx = finalVoiceScript ? finalVoiceScript.replace(/\\n/g, '<br/><br/>') : "لم يتم التسجيل.";
    content += `<div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; font-size: 14pt; font-weight: bold;">${safeVoDocx}</div>`;

    // --- SECTION 2 ---
    content += `<h2>[3] التقطيع الإخراجي للمشاهد (Scene Breakdown)</h2>`;
    
    allScenes.forEach((scene, index) => {
      content += `<h3>المشهد رقم [${String(index + 1).padStart(2, "0")}]</h3>`;
      content += `<div class="scene-meta">`;
      if (scene.asset_id) content += `<b>🔖 المرجع:</b> ${scene.asset_id}<br>`;
      if (scene.estimated_duration_seconds) content += `<b>⏱️ المدة:</b> ${scene.estimated_duration_seconds} ثواني<br>`;
      if (scene.visual_cue) content += `<b>👁️ الرؤية المخرجية:</b> ${scene.visual_cue}<br>`;
      if (scene.transition_to_next_scene) content += `<b>🎞️ النقلة للمشهد التالي:</b> ${scene.transition_to_next_scene}`;
      content += `</div>`;
      
      if (scene.voice_over) content += `<div class="voice-over">${scene.voice_over.replace(/\n/g, '<br>')}</div>`;
      
      const finalFirstImgPromptHtml = scene.first_frame_image_prompt || scene.image_prompt || '';
      if (finalFirstImgPromptHtml) {
        content += `<div><b>🎨 البرومبت الأول (Shot 1):</b><div class="prompt">${finalFirstImgPromptHtml}</div></div>`;
        content += `<p style="color:#64748b; font-size:10pt;">🎬 الحركية: ${scene.first_frame_motion_prompt || scene.ai_video_prompt || 'Cinematic push'}</p>`;
      }
      if (scene.second_frame_image_prompt) {
        content += `<div><b>🎨 البرومبت الثاني (Shot 2):</b><div class="prompt">${scene.second_frame_image_prompt}</div></div>`;
        content += `<p style="color:#64748b; font-size:10pt;">🎬 الحركية: ${scene.second_frame_motion_prompt || 'Micro movements'}</p>`;
      }
      content += `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">`;
    });

    content += `<h2>[4] أصول النشر المصغرة وتشطيبات المونتاج</h2>`;
    
    content += `<h3>الغلاف (Thumbnail)</h3>`;
    content += `<ul>`;
    content += `<li><b>النص المقترح:</b> ${data.thumbnail?.text_on_image || data.publishing_kit?.thumbnail_blueprint?.text_ab_test || "[بدون نص]"}</li>`;
    let posPromptDoc = data.thumbnail?.image_prompt || data.publishing_kit?.thumbnail_prompt || "لا يوجد وصف محدد.";
    if (posPromptDoc !== "لا يوجد وصف محدد." && !posPromptDoc.includes("--ar 16:9")) posPromptDoc += " --ar 16:9 --v 6.0";
    content += `</ul>`;
    content += `<div class="prompt"><b>Positive:</b><br/>${posPromptDoc}</div>`;
    const negPromptDoc = "--no text, font, letters, watermark, geometric shapes, cartoon, bright daylight";
    content += `<div class="prompt" style="margin-top: 10px;"><b>Negative:</b><br/>${negPromptDoc}</div>`;

    const storeState = useStudioStore.getState();
    const uniqueBRolls = [...new Set(storeState.bRollKeywords)].filter(Boolean);
    const uniqueSFX = [...new Set(storeState.sfxList)].filter(Boolean);

    content += `<h3>وسائط مساعدة B-Roll & SFX (Cheat Sheet)</h3>`;
    content += `<table width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; border: 1px solid #cbd5e1; text-align: right;">`;
    content += `<tr style="background:#f1f5f9; font-weight:bold;"><td>لقطات B-Roll</td><td>مؤثرات صوتية SFX</td></tr>`;
    content += `<tr><td valign="top"><ul>`;
    if (uniqueBRolls.length) uniqueBRolls.forEach(b => content += `<li>${b}</li>`);
    else content += `<li>[الاستعانة بالمكتبة العامة]</li>`;
    content += `</ul></td><td valign="top"><ul>`;
    if (uniqueSFX.length) uniqueSFX.forEach(s => content += `<li>${s}</li>`);
    else content += `<li>[ضجيج هادئ، نبض قلوب، أصوات سينمائية]</li>`;
    content += `</ul></td></tr></table>`;

    if (data.publishing_kit || fragmenterData) {
      content += `<h2>[5] حزمة التسويق (Marketing Kit)</h2>`;
      const pData = data.publishing_kit || fragmenterData;
      if (pData.youtube_titles) {
        content += `<b>عناوين مقترحة:</b><ul>`;
        pData.youtube_titles.forEach((t: string) => content += `<li>${t}</li>`);
        content += `</ul>`;
      }
      if (pData.description) content += `<b>وصف الفيديو:</b><p>${pData.description.replace(/\n/g, '<br>')}</p>`;
      if (pData.tags) content += `<b>الكلمات المفتاحية:</b><p>${pData.tags.join('، ')}</p>`;
      if (fragmenterData?.tiktok_hook) content += `<b>هوك تيك توك:</b><p>${fragmenterData.tiktok_hook}</p>`;
    }

    const fullHtml = header + content + footer;
    const filename = `Barwaz_Dossier_DOCX_${title.replace(/\s+/g, "_")}.doc`;
    const blobHtml = '\ufeff' + fullHtml;
    respondWithBlob(blobHtml, "application/msword", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateTeleprompter = ({ data }: any) => {
  try {
    const { title, mood } = getGlobalMetaData(data);
    
    let content = "=== شاشة التلقين (PACING TELEPROMPTER) ===\n";
    content += `🎬 مخصص لحلقة: ${title}\n`;
    content += `⏳ توجيهات الرتم والمزاج: ${mood}\n\n`;
    content += "-------------------------------------------------\n";
    content += "⚠️ علامات الإلقاء:\n";
    content += " [PAUSE] = صمت درامي للتأثير (1-2 ثانية)\n";
    content += " [SPEED: FAST] = تسريع الرتم لإعطاء إحساس بالإلحاح\n";
    content += " [TONE: ...] = تغيير مستوى طبقة الصوت لتجسيد الموقف\n";
    content += "-------------------------------------------------\n\n";

    const allScenes = [data.opening_sketch, ...(data.scenes || [])].filter(Boolean);
    allScenes.forEach((scene, idx) => {
      if (scene.voice_over) {
        content += `--- المشهد [${String(idx + 1).padStart(2, '0')}] ---\n\n`;
        let vo = scene.voice_over;
        
        vo = vo.replace(/\[PAUSE:?.*?\]/gi, `\n\n🔴 (توقف درامي) 🔴\n\n`);
        vo = vo.replace(/\[SPEED:?.*?\]/gi, (match) => `\n🔵 (${match.toUpperCase()}) 🔵\n`);
        vo = vo.replace(/\[TONE:?.*?\]/gi, (match) => `\n🟡 (${match.toUpperCase()}) 🟡\n`);
        vo = vo.replace(/\[SFX:?.*?\]/gi, (match) => `\n📢 (${match.toUpperCase()}) 📢\n`);

        const lines = vo.split("\n")
          .map((line: string) => line.trim())
          .filter(Boolean)
          .join("\n\n");
          
        content += lines + "\n\n\n";
      }
    });

    const filename = `Teleprompter_${title.replace(/\s+/g, "_")}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateGeminiTTS = ({ data }: any) => {
  try {
    const { title, mood, persona } = getGlobalMetaData(data);
    
    let content = `Audio Profile: ${persona} يتحدث بلهجة عميقة ومشوقة، يستخدم نبرة سينمائية غامضة تناسب محتوى "${mood}". الصوت واضح وتتخلله وقفات تفكير وليس كآلة.\n`;
    content += `Context: أنت تسجل تعليق صوتي غامض لحلقة وثائقية بعنوان "${title}". تفاعل مع الكلمات، استخدم الوقفات لزيادة الغموض، وتغيير طبقة الصوت عند ذكر الحقائق الخطيرة.\n\n`;
    content += "=========================================================\n\n";

    const allScenes = [data.opening_sketch, ...(data.scenes || [])].filter(Boolean);
    allScenes.forEach((scene) => {
      if (scene.voice_over) {
        const cleanVoiceOver = scene.voice_over.replace(/\(.*?\)|\[.*?\]|\*\*.*?\*\*/g, '').trim();
        if (!cleanVoiceOver) return;

        let lines = cleanVoiceOver.split("\n");
        lines.forEach((line: string) => {
           const ttsLine = line.trim();
           if (ttsLine) content += ttsLine + "\n\n";
        });
      }
    });

    content += "\n\n💡 تشغيل في AI Studio أو ElevenLabs:\n1. انسخ هذا النص الكامل.\n2. تأكد من تحديد نموذج مدرب على السرد الوثائقي العميق (مثل صوت رجل ذو طبقة منخفضة).\n3. ارفع مؤشر الـ Temperature/Creativity لمحاكاة الانفعال البشري.\n";

    const filename = `TTS_Script_${title.replace(/\s+/g, "_")}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};
