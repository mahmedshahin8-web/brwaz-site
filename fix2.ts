import fs from 'fs';

const text = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = text.split('\n');

// Find the line index for "cum      if (isFailedProxy) {"
const idx = lines.findIndex(l => l.includes("cum      if (isFailedProxy) {"));

if (idx !== -1) {
  const codeToInsert = `        cumulativeScenes = [...cumulativeScenes, ...chapterScenes];
        setGeneratedScenes(cumulativeScenes);
      }

      if (abortControllerRef.current?.signal.aborted) throw new Error('AbortError');
      setStatus('جاري تغليف الحلقة والشورتس...');
      setProgress(90);
      const packagingResult = await generatePackaging(researchMap.video_title, researchMap.research_data, cumulativeScenes);

      if (abortControllerRef.current?.signal.aborted) throw new Error('AbortError');
      const allChapterSources = cumulativeScenes.flatMap(s => s.sources || []);
      
      const processedScenes = cumulativeScenes.map((s, idx) => ({
        ...s,
        asset_id: \`[Scene \${String(idx + 1).padStart(2, '0')}]\`,
        image_prompt_midjourney: applyGlobalStyle(s.image_prompt_midjourney || '')
      }));
      const processedShorts = (packagingResult.shorts || []).map((s: any) => ({
        ...s,
        visual_prompt: applyGlobalStyle(s.visual_prompt || '')
      }));
      packagingResult.shorts = processedShorts;

      const finalData: EpisodeData = {
        video_title: researchMap.video_title,
        thumbnail: researchMap.thumbnail ? { ...researchMap.thumbnail, image_prompt: applyGlobalStyle(researchMap.thumbnail.image_prompt || '') } : { image_prompt: '', text_on_image: '' },
        opening_sketch: processedScenes[0] || { asset_id: "[ASSET-006]", voice_over: "", visual_cue: "", montage_instructions: "", sound_design: "", image_prompt_midjourney: "", ai_video_prompt: "" },
        scenes: processedScenes.slice(1),
        sources: [...(researchMap.sources || []), ...allChapterSources],
        publishing_kit: packagingResult.packaging,
        shorts: packagingResult.shorts
      };
      
      setData(finalData);
      
      const allVoiceovers = [finalData.opening_sketch, ...finalData.scenes].map(s => s.voice_over).join('\\n\\n');
      setRawScriptText(allVoiceovers);
      const extracted = extractAndCleanScript(allVoiceovers);
      const optimized = convertToEgyptian(extracted);
      setFinalVoiceScript(optimized);

      autoSaveDossier(finalData);

      setResearchMap(null); 
      setActiveTab('script');
    } catch(err: any) {
      if (err.message === 'AbortError') {
        showToast('تم إيقاف الإنشاء بناءً على طلبك', 'success');
        return;
      }
      const isFailedProxy = err.message?.includes('Failed to call') || err.message?.includes('500') || err.message?.includes('6');
      if (isFailedProxy) {`;
      
  lines[idx] = codeToInsert;
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
} else {
  console.log("Could not find the line");
}
