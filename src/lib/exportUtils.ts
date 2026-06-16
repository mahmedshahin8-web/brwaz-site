import { EpisodeData } from '../types';
import { notify } from './notify';

export const copyToClipboard = async (
  text: string,
  identifier: string = "تم النسخ بنجاح",
) => {
  try {
    await navigator.clipboard.writeText(text);
    notify.classified(identifier);
  } catch (err) {
    notify.breach("فشل النسخ");
  }
};

const nativeDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Give the browser time to initiate the download before revoking the URL
  // This prevents silent download failures on Safari/iOS and some Chrome versions
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
};

export const exportToDocx = (data: EpisodeData) => {
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>${data.video_title}</title>
  <style>
    body { font-family: 'Arial', sans-serif; dir: rtl; text-align: right; line-height: 1.6; }
    h1 { color: #2c3e50; font-size: 24pt; text-align: center; }
    h2 { color: #34495e; font-size: 18pt; border-bottom: 1px solid #bdc3c7; padding-bottom: 4px; }
    h3 { color: #7f8c8d; font-size: 14pt; }
    .scene-meta { font-size: 10pt; color: #7f8c8d; margin-bottom: 10px; background: #f9f9f9; padding: 10px; border: 1px solid #e0e0e0; }
    .voice-over { font-size: 14pt; font-weight: bold; color: #000; margin-bottom: 15px; }
    .prompt { font-size: 10pt; color: #2980b9; direction: ltr; text-align: left; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #bdc3c7; padding: 8px; text-align: right; }
    th { background: #ecf0f1; }
  </style>
  </head><body><div dir='rtl'>`;
  
  const footer = "</div></body></html>";
  
  let content = `<h1>${data.video_title}</h1>`;
  
  const allScenesForTime = [data.opening_sketch, ...data.scenes].filter(Boolean);
  const totalDurationSecs = allScenesForTime.reduce((acc, scene) => acc + (Number(scene.estimated_duration_seconds) || Number((scene as any).estimated_seconds) || 10), 0);
  const totalMins = Math.floor(totalDurationSecs / 60);
  const totalSecs = Math.floor(totalDurationSecs % 60);
  const durationFormatted = String(totalMins).padStart(2, '0') + ":" + String(totalSecs).padStart(2, '0');
  
  content += `<h3>إجمالي الوقت التقديري: ${durationFormatted} دقائق</h3>`;
  
  if (data.publishing_kit) {
    content += `<h2>بيانات النشر (SEO)</h2>`;
    content += `<ul>`;
    data.publishing_kit.youtube_titles?.forEach((t: string) => content += `<li><strong>عنوان:</strong> ${t}</li>`);
    content += `</ul>`;
    content += `<p><strong>الوصف:</strong><br/>${data.publishing_kit.description_al_daheeh_style?.replace?.(/\\n/g, '<br/>') || data.publishing_kit.description_al_daheeh_style || ''}</p>`;
  }

  content += `<h2>السكريبت والمشاهد</h2>`;
  
  const allScenes = [data.opening_sketch, ...data.scenes].filter(Boolean);
  
  allScenes.forEach((scene, index) => {
    content += `<h3>المشهد ${index + 1}: ${scene.asset_id || `Scene_0${index+1}`}</h3>`;
    content += `<div class="scene-meta">`;
    if (scene.estimated_duration_seconds) content += `<p><strong>المدة التقديرية:</strong> ${scene.estimated_duration_seconds} ثانية</p>`;
    content += `<p><strong>الوصف البصري:</strong> ${scene.visual_cue || ''}</p>`;
    if (scene.montage_instructions) content += `<p><strong>توجيهات المونتاج:</strong> ${scene.montage_instructions}</p>`;
    if (scene.sound_design) content += `<p><strong>التصميم الصوتي:</strong> ${scene.sound_design}</p>`;
    if (scene.sfx) content += `<p><strong>المؤثرات الصوتية:</strong> ${scene.sfx}</p>`;
    content += `</div>`;
    content += `<p class="voice-over">${scene.voice_over || ''}</p>`;
    content += `<p class="prompt"><strong>Shot 1 Prompt:</strong> ${scene.first_frame_image_prompt || scene.image_prompt || ''}</p>`;
  });

  const fullHtml = header + content + footer;
  const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
  nativeDownload(blob, `${(data.video_title || 'Export').replace(/\s+/g, "_")}_Production_File.doc`);
};

export const exportToCSV = (data: EpisodeData) => {
  let csvContent = "Scene,Voice Over,Duration (S),Shot 1 Prompt,Shot 1 Motion,Shot 2 Prompt,Shot 2 Motion,B-Roll Query,Negative Prompt\n";
  const allScenes = [data.opening_sketch, ...data.scenes].filter(Boolean);
  
  const negativePrompt = "no photorealism, 3d render, bokeh, european faces, blond hair, blue eyes, modern technology, generic arabian nights, aladdin style, orientalist tropes, text, typography, watermark";

  allScenes.forEach((scene, index) => {
    const vo = scene.voice_over || '';
    const wordCount = vo.trim().split(/\s+/).length;
    const dynamicDuration = Math.max(3, Math.ceil(wordCount / 2.2));
    
    const voEscaped = `"${vo.replace(/"/g, '""')}"`;
    const prompt1 = `"${(scene.first_frame_image_prompt || scene.image_prompt || '').replace(/"/g, '""')}"`;
    const motion1 = `"${(scene.first_frame_motion_prompt || scene.ai_video_prompt || '').replace(/"/g, '""')}"`;
    const prompt2 = `"${(scene.second_frame_image_prompt || '').replace(/"/g, '""')}"`;
    const motion2 = `"${(scene.second_frame_motion_prompt || '').replace(/"/g, '""')}"`;
    const broll = `"${(scene.b_roll_keywords || scene.b_roll_search_query || '').replace(/"/g, '""')}"`;
    
    csvContent += `Scene ${index + 1},${voEscaped},${dynamicDuration},${prompt1},${motion1},${prompt2},${motion2},${broll},"${negativePrompt}"\n`;
  });

  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  nativeDownload(blob, `${(data.video_title || 'Export').replace(/\s+/g, "_")}_Shotlist.csv`);
};

export const exportToPremiereXML = (data: EpisodeData) => {
  let clipItems = '';
  const allScenes = [data.opening_sketch, ...data.scenes].filter(Boolean);
  
  let currentStart = 0;
  const FPS = 24; // Standard cinematic frame rate as requested for accurate timecodes
  
  allScenes.forEach((scene, index) => {
    const vo = scene.voice_over || '';
    // Remove markers for duration calculation
    const cleanVO = vo.replace(/\[.*?\]/g, "");
    const wordCount = cleanVO.trim().split(/\s+/).length;
    
    // Dynamic Duration Calculation: Words / 2.0 words per second for a more relaxed but precise pace
    const dynamicDurationSecs = Math.max(4, Math.ceil(wordCount / 2.0));
    const durationFrames = Math.round(dynamicDurationSecs * FPS);
    
    const textOut = vo.substring(0, 80).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    clipItems += `
        <clipitem id="scene_${index}">
            <name>S${index + 1}: ${textOut}...</name>
            <duration>${durationFrames}</duration>
            <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
            <start>${currentStart}</start>
            <end>${currentStart + durationFrames}</end>
            <in>0</in>
            <out>${durationFrames}</out>
            <file id="file_${index}">
                <name>Shot_${index + 1}</name>
                <media>
                    <video>
                        <duration>${durationFrames}</duration>
                        <samplecharacteristics>
                            <width>1920</width>
                            <height>1080</height>
                        </samplecharacteristics>
                    </video>
                </media>
            </file>
            <labels><label2>Iris</label2></labels>
            <comments>VFX: ${scene.visual_cue || (scene as any).visual_concept || ''} | Prompt: ${scene.first_frame_image_prompt || scene.image_prompt || ''}</comments>
        </clipitem>
    `;
    currentStart += durationFrames;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
    <project>
        <name>${(data.video_title || 'Export').replace(/&/g, '&amp;')}</name>
        <children>
            <sequence id="sequence_1">
                <name>${(data.video_title || 'Export').replace(/&/g, '&amp;')} - Final Production</name>
                <duration>${currentStart}</duration>
                <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
                <media>
                    <video>
                        <format>
                            <samplecharacteristics>
                                <width>1920</width>
                                <height>1080</height>
                                <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
                            </samplecharacteristics>
                        </format>
                        <track>
${clipItems}
                        </track>
                    </video>
                </media>
            </sequence>
        </children>
    </project>
</xmeml>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  nativeDownload(blob, `${(data.video_title || 'Export').replace(/\s+/g, "_")}_Cinematic_Timeline.xml`);
};
