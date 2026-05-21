import JSZip from 'jszip';

self.onmessage = async (e: MessageEvent) => {
  const { data, exportType, finalVoiceScript } = e.data;
  
  if (!data || !data.video_title) {
    self.postMessage({ success: false, error: "Invalid data for ZIP extraction." });
    return;
  }

  try {
    const zip = new JSZip();

    if (exportType === "omni") {
      // 1. Script
      zip.file("Script.txt", finalVoiceScript || "");
      
      // 2. Audio Voiceover (ElevenLabs optimized)
      const cleanVoiceover = (finalVoiceScript || "").replace(/\.{2,}/g, '،').replace(/\n\s*\n/g, '\n');
      zip.file("Audio_Voiceover.txt", cleanVoiceover);
      
      // 3. Packaging & SEO
      if (data.publishing_kit) {
        zip.file("packaging.json", JSON.stringify(data.publishing_kit, null, 2));
      }

      // 4. Shorts (if available)
      if (data.shorts && data.shorts.length > 0) {
         zip.file("shorts.json", JSON.stringify(data.shorts, null, 2));
         const shortsText = data.shorts.map((s: any, idx: number) => `Short ${idx + 1}:\n${s.script}`).join("\n\n");
         zip.file("Shorts.txt", shortsText);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      self.postMessage({ success: true, blob: content });
      return;
    }

    // Traditional ZIP
    // ... rest of regular zip logic

    // 1. Script Folder
    const scriptFolder = zip.folder("1_Script")!;
    let scriptText = `السكريبت الكامل لـ: ${data.video_title}\nالمود السردي: ${data.mood}\n\n`;
    if (data.scenes && data.scenes.length > 0) {
      data.scenes.forEach((scene: any) => {
         scriptText += `[المشهد ${scene.asset_id || ""}]\n`;
         scriptText += `الراوي: ${scene.voice_over}\n`;
         scriptText += `بصريات: ${scene.visual_cue}\n`;
         scriptText += `كلمات مفتاحية: ${scene.b_roll_keywords || scene.b_roll_search_query || ""}\n`;
         scriptText += `صوتيات: ${scene.sound_design || scene.sfx || ""}\n\n----------------------------\n\n`;
      });
    }
    scriptFolder.file("Master_Script.txt", scriptText);

    // 2. YouTube Assets Folder
    const ytFolder = zip.folder("2_YouTube_Assets")!;
    let ytText = `العناوين المقترحة:\n`;
    if (data.publishing_kit?.youtube_titles) {
      data.publishing_kit.youtube_titles.forEach((t: string) => ytText += `- ${t}\n`);
    }
    ytText += `\nالوصف:\n${data.publishing_kit?.description_al_daheeh_style || data.publishing_kit?.description || ""}\n`;
    ytText += `\nالكلمات المفتاحية (Tags):\n${(data.publishing_kit?.tags || []).join(", ")}\n`;
    ytText += `\nفكرة الصورة المصغرة:\n${data.publishing_kit?.thumbnail_concept || data.thumbnail?.image_prompt || ""}\n`;
    ytText += `\nPrompt الصورة للذكاء الاصطناعي:\n${data.publishing_kit?.thumbnail_midjourney_prompt || ""}\n`;
    ytFolder.file("YouTube_Metadata.txt", ytText);

    // 3. Shorts Folder
    const shortsFolder = zip.folder("3_Shorts")!;
    if (data.shorts && data.shorts.length > 0) {
      data.shorts.forEach((s: any, idx: number) => {
        let shortText = `Short ${idx + 1}: ${s.title}\n\n`;
        shortText += `Hook:\n${s.hook}\n\n`;
        shortText += `Body:\n${s.body}\n\n`;
        shortText += `CTA:\n${s.cta}\n\n`;
        shortText += `Visuals:\n${s.visual_instructions}\n`;
        shortsFolder.file(`Short_${idx + 1}.txt`, shortText);
      });
    } else {
       shortsFolder.file("Shorts_Info.txt", "No shorts available.");
    }

    // 4. Social Media Folder (Omnichannel)
    const socialFolder = zip.folder("4_Social_Media")!;
    if (data.omnichannel) {
       if (data.omnichannel.twitter_thread && data.omnichannel.twitter_thread.length > 0) {
         let threadText = data.omnichannel.twitter_thread.map((t: string, i: number) => `${i+1}/ ${t}`).join("\n\n");
         socialFolder.file("Twitter_Thread.txt", threadText);
       }
       if (data.omnichannel.social_posts && data.omnichannel.social_posts.length > 0) {
         let postsText = "";
         data.omnichannel.social_posts.forEach((p: any) => {
            postsText += `[ ${p.platform} ]\n${p.content}\n\n---\n\n`;
         });
         socialFolder.file("Social_Posts.txt", postsText);
       }
    } else {
       socialFolder.file("Social_Media.txt", "Social media assets not generated.");
    }

    // Generate ZIP blob
    const content = await zip.generateAsync({ type: "blob" });
    self.postMessage({ success: true, blob: content });
    
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message || "Failed to create ZIP" });
  }
};
