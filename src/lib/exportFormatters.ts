import { useStudioStore } from '../store/useStudioStore';

// Use a robust native download function to avoid 0-byte file issues
const nativeDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Don't revoke immediately to prevent 0-byte downloads
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 10000);
};

const respondWithBlob = (content: string, type: string, filename: string) => {
  const blob = new Blob([content], { type });
  nativeDownload(blob, filename);
};

const getGlobalMetaData = (inputData: any, topic?: string) => {
  const data = inputData?.data || inputData; // Un-nest if accidentaly wrapped
  const creationDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const scenesArray = Array.isArray(data?.scenes) ? data.scenes : (data?.scenes ? Object.values(data.scenes) : []);
  const allScenes = [data?.opening_sketch, ...scenesArray].filter(Boolean);
  const totalDurationSecs = allScenes.reduce((acc, scene) => acc + (Number(scene?.estimated_duration_seconds) || Number((scene as any)?.estimated_seconds) || 12), 0);
  const totalMins = Math.floor(totalDurationSecs / 60);
  const totalSecs = Math.floor(totalDurationSecs % 60);
  const durationFormatted = String(totalMins).padStart(2, '0') + ":" + String(totalSecs).padStart(2, '0');
  
  let title = data?.video_title || data?.title || topic || "وثيقة_الإنتاج";
  // Sanitize title to prevent OS-level filename rejection, keeping Arabic and English intact
  title = title.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");
  
  const mood = data?.mood || "Cinematic Thriller / وثائقي مشوق";
  const persona = data?.persona || "النبّاش / Investigator";

  return { creationDate, allScenes, durationFormatted, title, mood, persona };
};

export const generateTxt = ({ data, fragmenterData, finalVoiceScript, topic }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data, topic);
    
    let content = "================================================================================\n";
    content += "                      DIRECTOR'S DOSSIER • CONFIDENTIAL \n";
    content += "================================================================================\n\n";
    
    // --- SECTION 1 ---
    content += "[1] CLASSIFIED METADATA\n";
    content += "--------------------------------------------------------------------------------\n";
    content += "PROJECT TITLE : " + title + "\n";
    content += "MOOD & TONE   : " + mood + "\n";
    content += "PERSONA       : " + persona + "\n";
    content += "EST. DURATION : " + durationFormatted + " MINUTES\n";
    content += "GENERATED ON  : " + creationDate + "\n";
    content += "CLEARANCE     : LEVEL 5 (CREW ONLY)\n\n";

    content += "[2] MASTER VOICEOVER SCRIPT\n";
    content += "--------------------------------------------------------------------------------\n";
    content += (finalVoiceScript || "No Master Voiceover recorded. Refer to Scene Breakdown.") + "\n\n";

    // --- SECTION 2 ---
    content += "================================================================================\n";
    content += "[3] SCENE-BY-SCENE BREAKDOWN\n";
    content += "================================================================================\n\n";

    allScenes.forEach((scene, index) => {
      content += "--- SCENE [" + String(index + 1).padStart(2, "0") + "] -------------------------------------------------------------\n";
      
      if (scene.voice_over) {
        let vo = scene.voice_over.replace(/\[PAUSE:?.*?\]/gi, '[PAUSE]')
                                 .replace(/\[SPEED:?.*?\]/gi, (m: string) => `[${m.replace(/[\[\]]/g, '').toUpperCase()}]`)
                                 .replace(/\[TONE:?.*?\]/gi, (m: string) => `[${m.replace(/[\[\]]/g, '').toUpperCase()}]`);
        content += "\n[VOICEOVER]\n" + vo + "\n";
      }
      
      content += "\n[VISUALS & CUES]\n";
      if (scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions) {
         content += "Director's Note (AR): " + (scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions) + "\n";
      }
      if (scene.text_on_screen) content += "Text On Screen  : " + scene.text_on_screen + "\n";
      if (scene.pop_culture_meme_insert) content += "Meme Insert     : " + scene.pop_culture_meme_insert + "\n";
      if (scene.b_roll_search_query || scene.b_roll_keywords) content += "Stock Footage   : " + (scene.b_roll_search_query || scene.b_roll_keywords).toUpperCase() + "\n";
      
      const finalFirstImgPromptTxt = scene.first_frame_image_prompt || scene.image_prompt || '';
      if (finalFirstImgPromptTxt) {
        content += "AI Image Prompt 1: " + finalFirstImgPromptTxt + "\n";
        const motion1 = scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in";
        content += "Camera Motion 1  : " + motion1 + "\n";
      }
      if (scene.second_frame_image_prompt) {
        content += "AI Image Prompt 2: " + scene.second_frame_image_prompt + "\n";
        content += "Camera Motion 2  : " + (scene.second_frame_motion_prompt || "Ken burns / Push-in") + "\n";
      }
      
      content += "\n[AUDIO & EDITING]\n";
      if (scene.sound_design) content += "Sound Design (SFX): " + scene.sound_design + "\n";
      if (scene.camera_movement || scene.montage_instructions) content += "Edit Instructions : " + (scene.camera_movement || scene.montage_instructions) + "\n";
      if (scene.transition_to_next_scene) content += "Transition        : " + scene.transition_to_next_scene + "\n";
      
      content += "\n";
    });

    content += "================================================================================\n";
    content += "[4] POST-PRODUCTION & THUMBNAIL\n";
    content += "================================================================================\n";
    content += "THUMBNAIL TEXT : " + (data.thumbnail?.text_on_image || data.publishing_kit?.thumbnail_blueprint?.text_ab_test || "[No Text]") + "\n";
    
    let posPrompt = data.thumbnail?.image_prompt || data.publishing_kit?.thumbnail_prompt || data.publishing_kit?.thumbnail_blueprint?.positive_prompt || "No specific prompt.";
    if (posPrompt !== "No specific prompt." && !posPrompt.includes("--ar 16:9")) {
      posPrompt += " --ar 16:9 --style raw --v 6.0";
    }
    const negPrompt = "--no text, font, letters, watermark, geometric shapes, 3d render, cartoon, bright daylight, flat colors, low quality";
    content += "AI Prompt      : " + posPrompt + "\n";
    content += "Negative Prompt: " + negPrompt + "\n\n";
    
    const storeState = useStudioStore.getState();
    const uniqueBRolls = [...new Set(storeState.bRollKeywords)].filter(Boolean);
    const uniqueSFX = [...new Set(storeState.sfxList)].filter(Boolean);

    content += "[CHEAT SHEET: B-ROLL & SFX]\n";
    if (uniqueBRolls.length > 0) content += "B-Rolls: " + uniqueBRolls.join(" | ") + "\n";
    if (uniqueSFX.length > 0) content += "SFX    : " + uniqueSFX.join(" | ") + "\n";
    content += "\n";

    content += "================================================================================\n";
    content += "[5] APPENDIX A: PUBLISHING STRATEGY & OVERLAYS\n";
    content += "================================================================================\n";

    if (data.publishing_kit || fragmenterData) {
      const pData = data.publishing_kit || fragmenterData;
  
      if (pData.episode_hashtag || pData.visual_branding_instructions) {
        content += "[GLOBAL VISUAL OVERLAYS & BRANDING]\n";
        if (pData.episode_hashtag) content += `EPISODE HASHTAG/WATERMARK: ${pData.episode_hashtag}\n`;
        if (pData.visual_branding_instructions) content += `BRANDING INSTRUCTIONS: ${pData.visual_branding_instructions}\n`;
        content += "\n";
      }

      const titles = pData.youtube_titles || [title];
      content += "[A/B TESTING TITLES]\n";
      titles.forEach((t: string) => content += "- " + t + "\n");
      content += "\n";
      
      const desc = data.publishing_kit?.description || fragmenterData?.description || "No description provided.";
      content += "[SEO DESCRIPTION]\n" + desc + "\n\n";
      
      const tags = data.publishing_kit?.tags || fragmenterData?.tags || [];
      if (tags.length > 0) content += "[KEYWORDS/TAGS]\n" + tags.join(", ") + "\n\n";
      
      const tiktokHook = fragmenterData?.tiktok_hook || fragmenterData?.shorts?.[0]?.hook || data.shorts?.[0]?.hook;
      if (tiktokHook) content += "[SHORT-FORM HOOK]\n" + tiktokHook + "\n\n";
    } else {
      content += "[NO PUBLISHING KIT GENERATED]\n\n";
    }

    if (data.sources && Array.isArray(data.sources)) {
      content += "================================================================================\n";
      content += "[6] APPENDIX B: DECLASSIFIED SOURCES\n";
      content += "================================================================================\n";
      data.sources.forEach((source: any) => {
        if (typeof source === 'string') {
          content += "- " + source + "\n";
        } else if (source) {
          const sTitle = source.title || source.name || source.source || "External File";
          const sUrl = source.url || source.link ? ` (${source.url || source.link})` : "";
          content += `- ${sTitle}${sUrl}\n`;
        }
      });
      content += "\n[END OF DOSSIER]\n";
    }

    const filename = `Barwaz_Dossier_TXT_${title}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateMd = ({ data, fragmenterData, finalVoiceScript, topic }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data, topic);

    let content = `# 📜 DIRECTOR'S DOSSIER • CONFIDENTIAL\n\n`;
    
    content += `## [1] CLASSIFIED METADATA\n\n`;
    content += `| Field | Value |\n`;
    content += `| :--- | :--- |\n`;
    content += `| **Project Title** | ${title} |\n`;
    content += `| **Mood/Tone** | ${mood} |\n`;
    content += `| **Persona** | ${persona} |\n`;
    content += `| **Est. Duration** | ${durationFormatted} Minutes |\n`;
    content += `| **Generated On** | ${creationDate} |\n`;
    content += `| **Clearance** | **LEVEL 5 (CREW ONLY)** |\n\n`;

    content += `## [2] MASTER VOICEOVER SCRIPT\n\n`;
    content += `> *Official voiceover recording script.*\n\n`;
    const safeVoScript = finalVoiceScript ? finalVoiceScript.replace(/\\n/g, '\n\n') : "No Master Voiceover recorded. Refer to Scene Breakdown.";
    content += `\`\`\`text\n${safeVoScript}\n\`\`\`\n\n`;

    content += `## [3] SCENE-BY-SCENE BREAKDOWN\n\n`;
    allScenes.forEach((scene, index) => {
      content += `### SCENE ${String(index + 1).padStart(2, "0")}\n\n`;
      
      let voHtml = (scene.voice_over || '')
        .replace(/\[PAUSE:?.*?\]/gi, (match: string) => `**[${match.toUpperCase().replace(/[\[\]]/g, '')}]**`)
        .replace(/\[SPEED:?.*?\]/gi, (match: string) => `**[${match.toUpperCase().replace(/[\[\]]/g, '')}]**`)
        .replace(/\[TONE:?.*?\]/gi, (match: string) => `**[${match.toUpperCase().replace(/[\[\]]/g, '')}]**`)
        .replace(/\n/g, '\n> ');

      content += `**🎙️ VOICEOVER**\n> ${voHtml}\n\n`;
      
      content += `**👁️ VISUALS & CUES**\n`;
      if (scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions) {
        content += `> **🔥 توجيهات المخرج للمونتاج:** ${scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions}\n\n`;
      }
      if (scene.text_on_screen) {
        content += `- **Typography (Text on Screen):** \`${scene.text_on_screen}\`\n`;
      }
      if (scene.pop_culture_meme_insert) {
        content += `- **Meme / Pop Culture:** ${scene.pop_culture_meme_insert}\n`;
      }
      if (scene.b_roll_search_query || scene.b_roll_keywords) {
        content += `- **Stock Footage:** \`${(scene.b_roll_search_query || scene.b_roll_keywords).toUpperCase()}\`\n`;
      }
      
      const finalFirstImgPrompt = scene.first_frame_image_prompt || scene.image_prompt;
      if (finalFirstImgPrompt) {
        content += `- **AI Image Prompt 1:**\n  \`\`\`text\n  ${finalFirstImgPrompt}\n  \`\`\`\n`;
        const motion1md = scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in";
        content += `- **Camera Motion 1:** *${motion1md}*\n`;
      }
      if (scene.second_frame_image_prompt) {
        content += `- **AI Image Prompt 2:**\n  \`\`\`text\n  ${scene.second_frame_image_prompt}\n  \`\`\`\n`;
        const motion2md = scene.second_frame_motion_prompt || "Ken burns / Push-in";
        content += `- **Camera Motion 2:** *${motion2md}*\n`;
      }
      
      content += `\n**🎵 AUDIO & EDITING**\n`;
      content += `- **Sound Design (SFX):** ${scene.sound_design || "No specific SFX"}\n`;
      content += `- **Edit Instructions:** ${scene.camera_movement || scene.montage_instructions || "Static / Default cuts"}\n`;
      if (scene.transition_to_next_scene) {
        content += `- **Transition:** ${scene.transition_to_next_scene}\n`;
      }
      
      content += `\n---\n\n`;
    });

    content += `## [4] POST-PRODUCTION & THUMBNAIL\n\n`;
    content += `- **Thumbnail Text:** ${data.thumbnail?.text_on_image || data.publishing_kit?.thumbnail_blueprint?.text_ab_test || "No Text"}\n`;
    
    let posPromptMD = data.thumbnail?.image_prompt || data.publishing_kit?.thumbnail_prompt || "No specific prompt.";
    if (posPromptMD !== "No specific prompt." && !posPromptMD.includes("--ar 16:9")) posPromptMD += " --ar 16:9 --style raw --v 6.0";
    content += `\n**AI Prompt Generator:**\n\`\`\`text\n${posPromptMD}\n\`\`\`\n`;
    content += `**Negative Prompt:**\n\`\`\`text\n--no text, font, letters, watermark, geometric shapes, cartoon, bright daylight, flat colors, low quality\n\`\`\`\n\n`;

    const storeState = useStudioStore.getState();
    const uniqueBRolls = [...new Set(storeState.bRollKeywords)].filter(Boolean);
    const uniqueSFX = [...new Set(storeState.sfxList)].filter(Boolean);
    
    content += `### CHEAT SHEET: B-ROLL & SFX\n`;
    if (uniqueBRolls.length > 0) content += `- **B-Rolls:** ${uniqueBRolls.map(b => `\`${b}\``).join(', ')}\n`;
    if (uniqueSFX.length > 0) content += `- **SFX:** ${uniqueSFX.map(s => `\`${s}\``).join(', ')}\n`;
    content += `\n`;

    content += `## [5] APPENDIX A: PUBLISHING STRATEGY & OVERLAYS\n\n`;
    const publishSource = data.publishing_kit || fragmenterData || {};
    if (Object.keys(publishSource).length > 0) {
      if (publishSource.episode_hashtag || publishSource.visual_branding_instructions) {
        content += `### 🎨 Global Visual Overlays & Branding\n`;
        if (publishSource.episode_hashtag) content += `- **Episode Hashtag/Watermark:** \`${publishSource.episode_hashtag}\`\n`;
        if (publishSource.visual_branding_instructions) content += `- **Branding Instructions:** ${publishSource.visual_branding_instructions}\n`;
        content += `\n`;
      }
      if (Array.isArray(publishSource.youtube_titles)) {
        content += `### A/B Testing Titles (Psychological Hooks)\n`;
        publishSource.youtube_titles.forEach((t: string) => content += `- **${t}**\n`);
      }
      if (publishSource.description) content += `\n### Video Description & SEO Copy\n${publishSource.description}\n`;
      if (Array.isArray(publishSource.tags)) content += `\n### SEO Keywords & Tags\n\`${publishSource.tags.join("` `")}\`\n`;
      
      const tiktokHook = fragmenterData?.tiktok_hook || fragmenterData?.shorts?.[0]?.hook || publishSource?.shorts?.[0]?.hook;
      if (tiktokHook) content += `\n### 📱 Short-Form Hook\n> ${tiktokHook}\n`;
      
    } else {
      content += `> No publishing kit generated.\n\n`;
    }

    const filename = `Barwaz_Dossier_MD_${title}.md`;
    respondWithBlob(content, "text/markdown;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateDocx = ({ data, fragmenterData, finalVoiceScript, topic }: any) => {
  try {
    const { creationDate, allScenes, durationFormatted, title, mood, persona } = getGlobalMetaData(data, topic);
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; dir: rtl; text-align: right; line-height: 1.6; color: #000000; background: #ffffff; }
    h1 { color: #000000; font-size: 28pt; text-align: center; border-bottom: 3px solid #000000; padding-bottom: 10px; margin-bottom: 5px; font-weight: bold; }
    .subtitle { text-align: center; color: #555555; font-size: 14pt; margin-bottom: 40px; letter-spacing: 2px; }
    h2 { color: #000000; font-size: 18pt; border-bottom: 2px solid #000000; padding-bottom: 6px; margin-top: 35px; text-transform: uppercase; }
    .meta-box { background: #f9f9f9; border: 2px solid #000000; padding: 15px; margin-bottom: 20px; font-family: 'Courier New', Courier, monospace; font-size: 11pt;}
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #000000; color: #ffffff; font-family: 'Courier New', Courier, monospace; font-size: 12pt; padding: 10px; border: 1px solid #000000; text-align: right;}
    td { border: 1px solid #000000; padding: 15px; vertical-align: top; }
    .scene-num { background: #000000; color: #ffffff; padding: 4px 8px; font-weight: bold; font-family: 'Courier New', Courier, monospace; display: inline-block; margin-bottom: 10px; }
    .voice-over { font-size: 16pt; font-weight: bold; color: #000000; margin-bottom: 15px; line-height: 1.8; font-family: Arial, sans-serif; }
    .box-label { font-family: 'Courier New', Courier, monospace; font-size: 10pt; color: #555555; text-transform: uppercase; display: block; border-bottom: 1px dotted #888888; margin-bottom: 5px; }
    .prompt { font-size: 10pt; color: #333333; direction: ltr; text-align: left; background: #f0f0f0; padding: 10px; border: 1px solid #cccccc; font-family: 'Courier New', Courier, monospace; margin-bottom: 10px;}
    .tag { background: #e0e0e0; border: 1px solid #999999; padding: 2px 5px; font-family: 'Courier New', Courier, monospace; font-size: 10pt; font-weight: bold; margin: 0 3px; display: inline-block; }
    ul { list-style-type: square; }
    li { margin-bottom: 8px; }
  </style>
  </head><body><div dir='rtl'>`;
    const footer = "</div></body></html>";
    
    let content = `<h1>${title}</h1>`;
    content += `<div class='subtitle'>DIRECTOR'S DOSSIER • CONFIDENTIAL</div>`;
    
    // --- SECTION 1 ---
    content += `<h2>[1] CLASSIFIED METADATA</h2>`;
    content += `<div class="meta-box">`;
    content += `<b>Title:</b> ${title}<br>`;
    content += `<b>Mood/Tone:</b> ${mood}<br>`;
    content += `<b>Persona:</b> ${persona}<br>`;
    content += `<b>Generated Date:</b> ${creationDate}<br>`;
    content += `<b>Security Clearance:</b> <span style="color:red">LEVEL 5 - CREW ONLY</span>`;
    content += `</div>`;

    // --- SECTION 2: MASTER VOICEOVER ---
    content += `<h2>[2] MASTER VOICEOVER SCRIPT</h2>`;
    const safeVoScript = finalVoiceScript ? finalVoiceScript.replace(/\n/g, '<br/>') : "No Master Voiceover recorded. Refer to Scene Breakdown.";
    content += `<div style="font-size: 16pt; font-weight: normal; color: #000000; margin-bottom: 30px; line-height: 1.8; font-family: Arial, sans-serif;">${safeVoScript}</div>`;

    // --- SECTION 3 ---
    content += `<h2>[3] SHOOTING SCRIPT & AV CUES</h2>`;
    
    content += `<table>`;
    content += `<tr>
      <th width="45%">VOICEOVER & PERFORMANCE</th>
      <th width="30%">VISUALS & PROMPTS</th>
      <th width="25%">AUDIO & EDITING</th>
    </tr>`;

    allScenes.forEach((scene, index) => {
      let voHtml = (scene.voice_over || '')
        .replace(/\[PAUSE:?.*?\]/gi, (match: string) => `<span class="tag">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\[SPEED:?.*?\]/gi, (match: string) => `<span class="tag">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\[TONE:?.*?\]/gi, (match: string) => `<span class="tag">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\n/g, '<br/>');

      content += `<tr>`;
      
      // Column 1: VO
      content += `<td>`;
      content += `<div class="scene-num">SCENE ${String(index + 1).padStart(2, "0")}</div>`;
      content += `<div class="voice-over">${voHtml}</div>`;
      content += `</td>`;
      
      // Column 2: Visuals
      content += `<td>`;
      
      if (scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions) {
         content += `<span class="box-label" style="color:#d90429;">🔥 توجيهات المخرج للمونتاج</span>`;
         content += `<div style="background:#fff0f0; border-right:3px solid #d90429; padding:10px; margin-bottom:15px; direction:rtl;">${scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions || "توجيهات عامة"}</div>`;
      }
      
      if (scene.text_on_screen) {
        content += `<span class="box-label">Text On Screen</span>`;
        content += `<div style="background:#eef2ff; border:1px solid #c7d2fe; padding:8px; font-family:monospace; margin-bottom:10px;">${scene.text_on_screen}</div>`;
      }
      
      if (scene.pop_culture_meme_insert) {
        content += `<span class="box-label">Meme / Pop Culture Insert</span>`;
        content += `<div style="background:#fef3c7; border:1px solid #fde68a; padding:8px; margin-bottom:10px;">${scene.pop_culture_meme_insert}</div>`;
      }

      if (scene.b_roll_search_query || scene.b_roll_keywords) {
         content += `<span class="box-label">Stock Footage</span>`;
         content += `<div style="background: #fff9c4; padding: 5px; font-family: monospace; font-size: 10pt; margin-bottom: 15px; border: 1px solid #cddc39;">🎥 ${(scene.b_roll_search_query || scene.b_roll_keywords || '').toUpperCase()}</div>`;
      }
      
      let imgPrmpt = scene.first_frame_image_prompt || scene.image_prompt || '';
      if (imgPrmpt) {
         content += `<span class="box-label">Shot 1: Image Prompt</span>`;
         content += `<div class="prompt">${imgPrmpt}</div>`;
         content += `<span class="box-label">Shot 1: Camera Motion</span>`;
         content += `<div style="background:#f0f0f0; padding:5px; margin-bottom:10px; font-family:monospace;">${scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in"}</div>`;
      }

      if (scene.second_frame_image_prompt) {
         content += `<span class="box-label">Shot 2: Image Prompt</span>`;
         content += `<div class="prompt">${scene.second_frame_image_prompt}</div>`;
         content += `<span class="box-label">Shot 2: Camera Motion</span>`;
         content += `<div style="background:#f0f0f0; padding:5px; margin-bottom:10px; font-family:monospace;">${scene.second_frame_motion_prompt || "Ken burns / Push-in"}</div>`;
      }

      content += `</td>`;
      
      // Column 3: Audio & Edit
      content += `<td>`;
      content += `<span class="box-label">Sound Design (SFX)</span>`;
      content += `<div style="margin-bottom: 15px;">${scene.sound_design || "No specific SFX"}</div>`;
      
      content += `<span class="box-label">Camera / Editing</span>`;
      content += `<div>${scene.camera_movement || scene.montage_instructions || "Static / Default cuts"}</div>`;
      content += `</td>`;
      
      content += `</tr>`;
    });
    
    content += `</table>`;

    // --- SECTION 3 ---
    if (data.publishing_kit || fragmenterData) {
      content += `<h2>[3] APPENDIX A: PUBLISHING STRATEGY & OVERLAYS</h2>`;
      const pData = data.publishing_kit || fragmenterData;
  
      
      if (pData.episode_hashtag || pData.visual_branding_instructions) {
        content += `<span class="box-label" style="color: #d90429;">Global Visual Overlays & Branding</span>`;
        content += `<ul style="margin-bottom: 20px; font-family: 'Courier New', Courier, monospace;">`;
        if (pData.episode_hashtag) content += `<li><strong>Episode Hashtag/Watermark:</strong> <span style="background: #e0e0e0; padding: 2px 5px;">${pData.episode_hashtag}</span></li>`;
        if (pData.visual_branding_instructions) content += `<li><strong>Branding Instructions:</strong> ${pData.visual_branding_instructions}</li>`;
        content += `</ul>`;
      }

      if (Array.isArray(pData.youtube_titles)) {
        content += `<span class="box-label">A/B Testing Titles (Psychological Hooks)</span><ul>`;
        pData.youtube_titles.forEach((t: string) => content += `<li><strong>${t}</strong></li>`);
        content += `</ul>`;
      }
      
      if (pData.description) {
         content += `<span class="box-label">Video Description & SEO Copy</span>`;
         content += `<p style="margin-bottom: 20px;">${pData.description.replace(/\n/g, '<br>')}</p>`;
      }
      
      if (Array.isArray(pData.tags)) {
         content += `<span class="box-label">SEO Keywords & Tags</span>`;
         content += `<p style="direction: ltr; text-align: left; color: red; font-family: monospace;">${pData.tags.join(', ')}</p>`;
      }
    }

    const fullHtml = header + content + footer;
    const filename = `Barwaz_Dossier_DOCX_${title}.doc`;
    const blobHtml = '\ufeff' + fullHtml;
    respondWithBlob(blobHtml, "application/msword", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateTeleprompter = ({ data, topic }: any) => {
  try {
    const { title, mood } = getGlobalMetaData(data, topic);
    
    let content = "=== شاشة التلقين (PACING TELEPROMPTER) ===\n";
    content += `🎬 مخصص لحلقة: ${title}\n`;
    content += `⏳ توجيهات الرتم والمزاج: ${mood}\n\n`;
    content += "-------------------------------------------------\n";
    content += "⚠️ علامات الإلقاء:\n";
    content += " [PAUSE] = صمت درامي للتأثير (1-2 ثانية)\n";
    content += " [SPEED: FAST] = تسريع الرتم لإعطاء إحساس بالإلحاح\n";
    content += " [TONE: ...] = تغيير مستوى طبقة الصوت لتجسيد الموقف\n";
    content += "-------------------------------------------------\n\n";

    const scenesArray = Array.isArray(data?.scenes) ? data.scenes : (data?.scenes ? Object.values(data.scenes) : []);
    const allScenes = [data?.opening_sketch, ...scenesArray].filter(Boolean);
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

    const filename = `Teleprompter_${title}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generateGeminiTTS = ({ data, topic }: any) => {
  try {
    const { title, mood, persona } = getGlobalMetaData(data, topic);
    
    let content = `Audio Profile: ${persona} يتحدث بلهجة عميقة ومشوقة، يستخدم نبرة سينمائية غامضة تناسب محتوى "${mood}". الصوت واضح وتتخلله وقفات تفكير وليس كآلة.\n`;
    content += `Context: أنت تسجل تعليق صوتي غامض لحلقة وثائقية بعنوان "${title}". تفاعل مع الكلمات، استخدم الوقفات لزيادة الغموض، وتغيير طبقة الصوت عند ذكر الحقائق الخطيرة.\n\n`;
    content += "=========================================================\n\n";

    const scenesArray = Array.isArray(data?.scenes) ? data.scenes : (data?.scenes ? Object.values(data.scenes) : []);
    const allScenes = [data?.opening_sketch, ...scenesArray].filter(Boolean);
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

    const filename = `TTS_Script_${title}.txt`;
    respondWithBlob(content, "text/plain;charset=utf-8", filename);
  } catch (err) {
    console.error(err);
  }
};

export const generatePrintablePDF = ({ data, fragmenterData, topic, finalVoiceScript }: any) => {
  try {
    const { title, mood, persona, creationDate } = getGlobalMetaData(data, topic);
    const timestamp = creationDate;
    const pData = data.publishing_kit || fragmenterData || {};
    
    // Build HTML string with a cinematic, highly professional Hollywood dossier style
    let htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>Director's Dossier - ${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;800&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          :root {
            --black: #000000;
            --dark-gray: #1a1a1a;
            --gray: #666666;
            --light-gray: #e5e5e5;
            --white: #ffffff;
            --red: #d90429;
            --red-light: #fff0f0;
            --font-ar-serif: 'Amiri', serif;
            --font-ar-sans: 'Cairo', sans-serif;
            --font-mono: 'Courier Prime', 'Courier New', monospace;
          }

          body {
            font-family: var(--font-ar-sans);
            background: #f4f4f4; /* Off-white for screen, white for print */
            color: var(--black);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Print Settings */
          @page {
            size: A4;
            margin: 20mm 15mm;
          }

          @media print {
            body { background: var(--white); }
            .print-btn { display: none !important; }
            .page-break-after { page-break-after: always; }
            .page-break-before { page-break-before: always; }
            .shadow-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
          }

          /* Screen Container */
          .shadow-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 40px auto;
            background: var(--white);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 20mm 15mm;
            box-sizing: border-box;
            position: relative;
          }

          /* --- COVER PAGE --- */
          .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            min-height: 230mm;
            text-align: center;
            border: 4px solid var(--black);
            padding: 40px;
            position: relative;
          }
          
          .cover-stamp {
            position: absolute;
            top: 40px;
            left: 40px;
            color: var(--red);
            font-family: var(--font-mono);
            font-weight: 700;
            font-size: 24px;
            border: 3px solid var(--red);
            padding: 8px 16px;
            transform: rotate(-10deg);
            opacity: 0.8;
            letter-spacing: 2px;
          }

          .cover-title {
            font-family: var(--font-ar-sans);
            font-weight: 800;
            font-size: 42px;
            margin: 20px 0;
            line-height: 1.3;
            color: var(--black);
            max-width: 80%;
          }

          .cover-subtitle {
            font-family: var(--font-mono);
            font-size: 14px;
            color: var(--gray);
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 60px;
          }

          .cover-meta {
            width: 100%;
            max-width: 500px;
            text-align: right;
            border-top: 2px solid var(--black);
            border-bottom: 2px solid var(--black);
            padding: 20px 0;
            margin-top: auto;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-family: var(--font-mono);
            font-size: 12px;
          }
          
          .meta-row:last-child { margin-bottom: 0; }
          .meta-label { color: var(--gray); text-transform: uppercase; }
          .meta-value { font-weight: 700; color: var(--black); font-family: var(--font-ar-sans); font-size: 14px; }

          /* --- DOSSIER CONTENT --- */
          .dossier-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--black);
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--gray);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .dossier-header strong { color: var(--black); }

          /* --- TABLE STYLES --- */
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          
          th {
            font-family: var(--font-mono);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: var(--black);
            color: var(--white);
            padding: 10px;
            text-align: right;
            border: 1px solid var(--black);
          }

          td {
            border: 1px solid var(--light-gray);
            border-bottom: 1px solid var(--black);
            padding: 15px;
            vertical-align: top;
          }

          tr { page-break-inside: avoid; }

          .col-vo { width: 45%; }
          .col-vis { width: 30%; }
          .col-aud { width: 25%; }

          /* SCENE Block */
          .scene-number {
            display: inline-block;
            background: var(--black);
            color: var(--white);
            font-family: var(--font-mono);
            font-size: 12px;
            font-weight: 700;
            padding: 3px 8px;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }

          .vo-text {
            font-family: var(--font-ar-serif);
            font-size: 16pt;
            line-height: 1.8;
            color: var(--black);
            font-weight: 700;
          }

          /* TAGS */
          .tag {
            display: inline-block;
            font-family: var(--font-mono);
            font-size: 9pt;
            font-weight: 700;
            padding: 2px 6px;
            margin: 0 4px;
            border-radius: 2px;
            direction: ltr;
            vertical-align: middle;
          }
          .tag-pause { background: var(--red-light); color: var(--red); border: 1px solid var(--red); }
          .tag-speed { background: #f0f4ff; color: #0044cc; border: 1px solid #0044cc; }
          .tag-tone { background: #fffcf0; color: #b38600; border: 1px solid #b38600; }
          
          /* VISUAL & AUDIO BOXES */
          .box-label {
            font-family: var(--font-mono);
            font-size: 9px;
            color: var(--gray);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
            display: block;
            border-bottom: 1px dotted var(--gray);
            padding-bottom: 2px;
          }

          .vis-desc, .aud-desc {
            font-family: var(--font-ar-sans);
            font-size: 10pt;
            color: var(--dark-gray);
            margin-bottom: 15px;
            line-height: 1.5;
          }

          .broll-tag {
            display: inline-block;
            font-family: var(--font-mono);
            font-size: 10px;
            background: #fff9c4;
            color: #827717;
            border: 1px solid #cddc39;
            padding: 3px 6px;
            margin-bottom: 15px;
            direction: ltr;
          }
          .broll-tag::before { content: '🎞️ B-ROLL: '; font-weight: 700; }

          .prompt-box {
            font-family: var(--font-mono);
            font-size: 8pt;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-left: 3px solid var(--black);
            padding: 8px;
            color: #495057;
            direction: ltr;
            text-align: left;
            word-wrap: break-word;
          }

          /* MARKETING SECTION */
          .marketing-wrapper {
            margin-top: 40px;
            border: 2px solid var(--black);
            padding: 20px;
            background: #fafafa;
          }
          
          .marketing-title {
            font-family: var(--font-mono);
            font-size: 18px;
            font-weight: 700;
            color: var(--black);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 0;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--black);
            padding-bottom: 10px;
          }

          .mkt-group { margin-bottom: 20px; }
          .mkt-group:last-child { margin-bottom: 0; }
          
          .mkt-list {
            margin: 0;
            padding-right: 20px;
            font-family: var(--font-ar-sans);
            font-weight: 700;
            font-size: 12pt;
          }
          .mkt-list li { margin-bottom: 10px; }

          .mkt-text {
            font-family: var(--font-ar-sans);
            font-size: 11pt;
            line-height: 1.6;
          }

          .mkt-tags {
            font-family: var(--font-mono);
            font-size: 10pt;
            color: var(--red);
            direction: ltr;
            text-align: right;
          }

          /* PRINT BUTTON */
          .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--red);
            color: var(--white);
            border: none;
            padding: 15px 30px;
            font-family: var(--font-ar-sans);
            font-weight: 800;
            font-size: 16px;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(217, 4, 41, 0.3);
            z-index: 1000;
            transition: transform 0.2s;
          }
          .print-btn:hover { transform: scale(1.05); }

        </style>
      </head>
      <body>
        
        <button class="print-btn" onclick="window.print()">🖨️ طباعة الوثيقة (PDF)</button>

        <div class="shadow-container">
          
          <!-- COVER PAGE -->
          <div class="cover-page page-break-after">
            <div class="cover-stamp">CONFIDENTIAL</div>
            
            <div style="margin: auto 0;">
              <div class="cover-subtitle">Director's Dossier & Shooting Script</div>
              <h1 class="cover-title">${title}</h1>
              <div class="cover-subtitle" style="margin-bottom: 0; margin-top: 20px;">AI Studio Automated Production</div>
            </div>

            <div class="cover-meta">
              <div class="meta-row">
                <span class="meta-label">Mood / Tone</span>
                <span class="meta-value">${mood}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Persona</span>
                <span class="meta-value">${persona}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Generated Date</span>
                <span class="meta-value" style="font-family: var(--font-mono); font-size: 12px;">${timestamp}</span>
              </div>
              <div class="meta-row" style="margin-top: 15px; border-top: 1px dotted #ccc; padding-top: 15px;">
                <span class="meta-label">Security Clearance</span>
                <span class="meta-value" style="color: var(--red); font-family: var(--font-mono);">LEVEL 5 - CREW ONLY</span>
              </div>
            </div>
          </div>

          <!-- PROFESSIONAL EDITING GUIDE (EGYPTIAN ARABIC) -->
          <div class="page-break-after" style="background: #fff9f9; padding: 30px; border: 2px solid var(--red); margin-bottom: 40px; box-shadow: 5px 5px 0px rgba(217, 4, 41, 0.1);">
            <div style="font-family: var(--font-mono); font-size: 14px; color: var(--red); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; font-weight: bold;">Executive Brief</div>
            <h2 style="font-family: var(--font-ar-sans); font-size: 26px; font-weight: 800; color: var(--black); margin-top: 0; margin-bottom: 15px; text-decoration: underline; text-decoration-color: var(--red);">دليل المونتاج السري 🎬 (للمونتير)</h2>
            <p style="font-family: var(--font-ar-serif); font-size: 14pt; color: var(--dark-gray); line-height: 1.8; margin-bottom: 30px;">
              الوثيقة دي معمولة عشان تطلع الحلقة بأعلى جودة بصرية وسمعية ممكنة. امشي على التعليمات دي خطوة بخطوة وقت المونتاج عشان تظبط الرتم وتحافظ على هوية القناة وتشد عين المشاهد من أول ثانية.
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <!-- الرتم والوقفات -->
              <div style="background: var(--white); padding: 15px; border-right: 4px solid var(--black); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 16px; color: var(--black); font-weight: 800; font-family: var(--font-ar-sans);">⏱️ 1. الرتم والوقفات (Pacing & Pauses)</h3>
                <ul style="font-size: 12pt; margin-bottom: 0; padding-right: 20px; line-height: 1.6; color: var(--dark-gray); font-family: var(--font-ar-serif);">
                  <li>لما تلاقي تاج <span class="tag tag-pause">PAUSE</span> في الاسكربت تحت، <strong>اوعى تقطع الصوت على طول</strong>. سيب ثانية لثانيتين صمت درامي عشان تدي للمشاهد فرصة يستوعب الصدمة أو المعلومة.</li>
                  <li>لما تلاقي <span class="tag tag-speed">SPEED: FAST</span>، سرّع الرتم شوية في الكاتات واستخدم <strong>Jump Cuts</strong> سريعة عشان تدي إحساس بالإلحاح أو التوتر.</li>
                </ul>
              </div>

              <!-- العناصر البصرية والهوية -->
              <div style="background: var(--white); padding: 15px; border-right: 4px solid var(--red); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 16px; color: var(--black); font-weight: 800; font-family: var(--font-ar-sans);">🎨 2. الهوية البصرية (Branding & Overlays)</h3>
                <ul style="font-size: 12pt; margin-bottom: 0; padding-right: 20px; line-height: 1.6; color: var(--dark-gray); font-family: var(--font-ar-serif);">
                  <li>\${pData.visual_branding_instructions ? \`<strong>تعليمات الهوية الخاصة بالحلقة دي:</strong> \${pData.visual_branding_instructions}\` : \`حط <strong>لوجو القناة</strong> دايماً في الكورنر بشكل خفيف وميبقاش مغطي على حاجة مهمة.\`}</li>
                  <li>\${pData.episode_hashtag ? \`<strong>هاشتاج الحلقة:</strong> استخدم <code style="font-family: var(--font-mono); background: #eee; padding: 2px 5px;">\${pData.episode_hashtag}</code> كـ Watermark خفيف تحت أو استخدمه في انتقالات النص.\` : \`دايماً خلي الوان التيكست والـ Lower Thirds متناسقة مع المود العام. استخدم خطوط واضحة وعريضة للفت الانتباه.\`}</li>
                </ul>
              </div>

              <!-- الفوترج والـ B-Roll -->
              <div style="background: var(--white); padding: 15px; border-right: 4px solid var(--gray); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 16px; color: var(--black); font-weight: 800; font-family: var(--font-ar-sans);">🎞️ 3. التعامل مع الـ B-Roll والصور</h3>
                <ul style="font-size: 12pt; margin-bottom: 0; padding-right: 20px; line-height: 1.6; color: var(--dark-gray); font-family: var(--font-ar-serif);">
                  <li><strong>قاعدة الـ 4 ثواني:</strong> متسيبش الشاشة فاضية أو عين المشاهد على نفس اللقطة الثابتة أكتر من 4 ثواني. دايماً استخدم تأثير الزوم البطيء <strong>(Ken Burns)</strong> على الصور الثابتة.</li>
                  <li>المود العام للحلقة هو <strong>(\${mood})</strong>، راعي ده في التلوين (Color Grading). لو المود غامض قلل الـ Saturation وزود الـ Contrast.</li>
                </ul>
              </div>

              <!-- هندسة الصوت -->
              <div style="background: var(--white); padding: 15px; border-right: 4px solid var(--black); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin-top: 0; font-size: 16px; color: var(--black); font-weight: 800; font-family: var(--font-ar-sans);">🎧 4. هندسة الصوت (Sound Design & Music)</h3>
                <ul style="font-size: 12pt; margin-bottom: 0; padding-right: 20px; line-height: 1.6; color: var(--dark-gray); font-family: var(--font-ar-serif);">
                  <li>المزيكا الخلفية لازم تكون هادية جداً تحت الـ Voiceover (حوالي -20db) عشان متغطيش على صوت المعلق. ارفع المزيكا في فترات الصمت بس.</li>
                  <li>استخدم <strong>مؤثرات صوتية (SFX)</strong> زي (Whoosh, Riser, Impact) مع كل انتقال (Transition) مهم أو لما كلمة قوية تظهر على الشاشة (Kinetic Typography).</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- MASTER VOICEOVER SCRIPT -->
          <div class="page-break-after">
            <div class="dossier-header">
              <span>PROJECT: <strong>${title}</strong></span>
              <span>DOCUMENT: <strong>MASTER VOICEOVER SCRIPT</strong></span>
            </div>
            <div style="font-size: 16pt; font-weight: 600; line-height: 2; margin-top: 30px;">
              ${finalVoiceScript ? finalVoiceScript.replace(/\n/g, '<br/>') : 'No Master Voiceover recorded. Refer to Scene Breakdown.'}
            </div>
          </div>

          <!-- DOSSIER CONTENT -->
          <div class="dossier-header">
            <span>PROJECT: <strong>${title}</strong></span>
            <span>DOCUMENT: <strong>SHOOTING SCRIPT & AV CUES</strong></span>
            <span>PAGE: <strong>AUTO</strong></span>
          </div>

          <table>
            <thead>
              <tr>
                <th class="col-vo">VOICEOVER & PERFORMANCE</th>
                <th class="col-vis">VISUALS & PROMPTS</th>
                <th class="col-aud">AUDIO & EDITING</th>
              </tr>
            </thead>
            <tbody>
    `;

    const scenesArray = Array.isArray(data?.scenes) ? data.scenes : (data?.scenes ? Object.values(data.scenes) : []);
    const allScenes = [data?.opening_sketch, ...scenesArray].filter(Boolean);
    
    allScenes.forEach((scene: any, idx: number) => {
      // Process voice over tags with specialized styling
      let voHtml = (scene.voice_over || '')
        .replace(/\[PAUSE:?.*?\]/gi, (match: string) => `<span class="tag tag-pause">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\[SPEED:?.*?\]/gi, (match: string) => `<span class="tag tag-speed">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\[TONE:?.*?\]/gi, (match: string) => `<span class="tag tag-tone">${match.toUpperCase().replace(/[\[\]]/g, '')}</span>`)
        .replace(/\n/g, '<br/>');

      const finalFirstImgPromptTxt = scene.first_frame_image_prompt || scene.image_prompt || '';
      const motion1Txt = scene.first_frame_motion_prompt || scene.ai_video_prompt || "Slow cinematic push-in";
      
      let visualHtml = '';
      
      if (scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions) {
         visualHtml += `<span class="box-label" style="color:var(--red);">🔥 توجيهات المخرج للمونتاج</span>`;
         visualHtml += `<div class="vis-desc" style="background:#fff0f0; border-right:3px solid var(--red); padding:10px; margin-bottom:15px; direction:rtl;">${scene.director_editing_notes_ar || scene.director_note || scene.montage_instructions || "توجيهات عامة"}</div>`;
      }
      
      if (scene.text_on_screen) {
        visualHtml += `<span class="box-label">Text On Screen (Typography)</span>`;
        visualHtml += `<div class="vis-desc" style="background:#eef2ff; border:1px solid #c7d2fe; padding:8px; font-family:var(--font-mono);">${scene.text_on_screen}</div>`;
      }
      
      if (scene.pop_culture_meme_insert) {
        visualHtml += `<span class="box-label">Pop Culture / Meme Insert</span>`;
        visualHtml += `<div class="vis-desc" style="background:#fef3c7; border:1px solid #fde68a; padding:8px;">${scene.pop_culture_meme_insert}</div>`;
      }

      if (scene.b_roll_search_query || scene.b_roll_keywords) {
        visualHtml += `<span class="box-label">Stock Footage Query</span>`;
        visualHtml += `<div class="broll-tag">${(scene.b_roll_search_query || scene.b_roll_keywords || '').toUpperCase()}</div>`;
      }

      if (finalFirstImgPromptTxt) {
        visualHtml += `<span class="box-label">Shot 1: Image Prompt</span>`;
        visualHtml += `<div class="prompt-box">${finalFirstImgPromptTxt.replace(/--ar/g, '<br/>--ar')}</div>`;
        visualHtml += `<span class="box-label">Shot 1: Motion / AI Video</span>`;
        visualHtml += `<div class="vis-desc" style="font-family:var(--font-mono); font-size:9pt; background:#f8f9fa; padding:5px; border-bottom:1px dashed #ccc;">${motion1Txt}</div>`;
      }

      if (scene.second_frame_image_prompt) {
        visualHtml += `<span class="box-label" style="margin-top:10px;">Shot 2: Image Prompt</span>`;
        visualHtml += `<div class="prompt-box">${scene.second_frame_image_prompt.replace(/--ar/g, '<br/>--ar')}</div>`;
        visualHtml += `<span class="box-label">Shot 2: Motion / AI Video</span>`;
        visualHtml += `<div class="vis-desc" style="font-family:var(--font-mono); font-size:9pt; background:#f8f9fa; padding:5px;">${scene.second_frame_motion_prompt || 'Ken burns / Push-in'}</div>`;
      }

      htmlContent += `
        <tr>
          <td class="col-vo">
            <div class="scene-number">SCENE ${String(idx + 1).padStart(2, '0')}</div>
            <div class="vo-text">${voHtml}</div>
          </td>
          <td class="col-vis">
            ${visualHtml}
          </td>
          <td class="col-aud">
            <span class="box-label">Sound Design (SFX)</span>
            <div class="aud-desc">${scene.sound_design || "No specific SFX"}</div>
            
            <span class="box-label">Camera / Editing</span>
            <div class="aud-desc">${scene.camera_movement || scene.montage_instructions || "Static / Default cuts"}</div>
          </td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
    `;

    // Add Marketing Section if available

    if (pData) {
      htmlContent += `
          <div class="marketing-wrapper page-break-before">
            <div class="marketing-title">APPENDIX A: Publishing & Distribution Strategy & Overlays</div>
            
      `;
      
      if (pData.episode_hashtag || pData.visual_branding_instructions) {
        htmlContent += `
            <div class="mkt-group" style="background: #fff0f0; padding: 15px; border-right: 4px solid var(--red);">
              <span class="box-label" style="color: var(--red);">Global Visual Overlays & Branding</span>
              <ul class="mkt-list" style="font-family: var(--font-mono); font-size: 11pt;">
                ${pData.episode_hashtag ? `<li style="margin-bottom: 8px;"><strong>Episode Hashtag/Watermark:</strong> <span style="background: var(--white); padding: 2px 5px; border: 1px solid #ccc;">${pData.episode_hashtag}</span></li>` : ""}
                ${pData.visual_branding_instructions ? `<li style="margin-top: 5px;"><strong>Branding Instructions:</strong> ${pData.visual_branding_instructions}</li>` : ""}
              </ul>
            </div>
        `;
      }

      if (Array.isArray(pData.youtube_titles) && pData.youtube_titles.length > 0) {
        htmlContent += `
            <div class="mkt-group">
              <span class="box-label">A/B Testing Titles (Psychological Hooks)</span>
              <ul class="mkt-list">
                ${pData.youtube_titles.map((t: string) => `<li>${t}</li>`).join('')}
              </ul>
            </div>
        `;
      }

      if (pData.description) {
        htmlContent += `
            <div class="mkt-group">
              <span class="box-label">Video Description & SEO Copy</span>
              <div class="mkt-text">${pData.description.replace(/\n/g, '<br/>')}</div>
            </div>
        `;
      }

      if (Array.isArray(pData.tags) && pData.tags.length > 0) {
        htmlContent += `
            <div class="mkt-group">
              <span class="box-label">SEO Keywords & Tags</span>
              <div class="mkt-tags">${pData.tags.join(', ')}</div>
            </div>
        `;
      }

      htmlContent += `
          </div>
      `;
    }

    htmlContent += `
        </div> <!-- End container -->
      </body>
      </html>
    `;

    // Open in a new tab via Blob URL to avoid document.write issues in modern browsers
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      // Focus the new window
      newWindow.focus();
    } else {
      console.warn("Popup blocked, could not open PDF.");
    }
  } catch (err) {
    console.error(err);
  }
};
