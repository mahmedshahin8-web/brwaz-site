import React, { useState } from "react";
import { EpisodeScene } from "../types";
import { Copy, Edit2, RefreshCw, CheckCircle, Image as ImageIcon, Edit3, Volume2, Square, ChevronDown, ChevronUp } from "lucide-react";
import { rewriteScript } from "../lib/gemini";
import { generateNanoBananaImage, editNanoBananaImageText } from "../services/imageService";

interface SceneCardProps {
  key?: React.Key;
  scene: EpisodeScene;
  onUpdate: (updatedScene: EpisodeScene) => void;
  copyToClipboard: (text: string, message?: string) => void;
  isDraggable?: boolean; // For future Dnd
}

export function SceneCard({ scene, onUpdate, copyToClipboard, isDraggable }: SceneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoiceOver, setEditedVoiceOver] = useState(scene.voice_over);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [interactiveInstruction, setInteractiveInstruction] = useState("");
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const status = scene.status || "pending";

  const handleApprove = () => {
    onUpdate({ ...scene, status: "approved" });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      onUpdate({ ...scene, voice_over: editedVoiceOver });
    }
    setIsEditing(!isEditing);
  };

  const handlePlayTTS = async () => {
    if (isPlayingTTS) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTTS(false);
      return;
    }
    
    // Clean text by preserving pauses conceptually
    let cleanText = editedVoiceOver.replace(/\[صمت درامي\]/g, "... ");
    cleanText = cleanText.replace(/🔊/g, "");

    const elKey = localStorage.getItem("elevenLabsKey")?.trim();
    const elVoiceId = localStorage.getItem("elevenLabsVoiceId")?.trim() || "pNInz6obbfDQGcgMyIGC"; // Default to a deep voice id

    if (elKey) {
      setIsPlayingTTS(true);
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
             "xi-api-key": elKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2"
          })
        });

        if (!res.ok) {
           throw new Error("ElevenLabs API failed");
        }
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingTTS(false);
        audio.onerror = () => setIsPlayingTTS(false);
        audio.play();
      } catch(e) {
         console.error(e);
         alert("فشل توليد الصوت عبر ElevenLabs، يرجى التأكد من المفتاح.");
         setIsPlayingTTS(false);
      }
      return;
    }

    // Fallback to browser TTS for preview
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ar-EG";
    utterance.rate = 0.9; // Slightly slower for dramatic effect
    utterance.pitch = 0.8; // Deeper voice roughly simulation "Al Nabash"
    
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);
    
    setIsPlayingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadMp3 = async () => {
    const elKey = localStorage.getItem("elevenLabsKey")?.trim();
    const elVoiceId = localStorage.getItem("elevenLabsVoiceId")?.trim() || "pNInz6obbfDQGcgMyIGC";
    
    if (!elKey) {
      alert("يرجى إضافة مفتاح ElevenLabs من الإعدادات للتمكين من تحميل الـ MP3");
      return;
    }
    
    try {
      let cleanText = editedVoiceOver.replace(/\[صمت درامي\]/g, "... ");
      cleanText = cleanText.replace(/🔊/g, "");

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}?output_format=mp3_44100_128`, {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
             "xi-api-key": elKey
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2"
          })
      });
      if (!res.ok) throw new Error("API Limit or Invalid Key");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Scene_${scene.asset_id.replace(/\W+/g, "_")}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      alert("فشل تحميل الملف الصوتي، تأكد من مفتاح الـ API");
    }
  };

  const colorCodeScript = (text: string) => {
    let html = text;
    // 1. Red: Danger, secrets, drama
    const redWords = ["السر", "الانهيار", "الكارثة", "فضيحة", "فاجعة", "خطير", "مصيبة", "مستحيل", "الغريب"];
    redWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      html = html.replace(regex, `<span class="text-red-700 font-bold px-1">${word}</span>`);
    });

    // 2. Gold: Numbers and specific dates
    html = html.replace(/(\d{4}|\d+%|\d+)/g, '<span class="text-yellow-600 font-bold px-1">$1</span>');

    // 3. Gray: Descriptive text and dramatic pauses
    html = html.replace(/(\[صمت درامي\]|🔊|\[.*?\])/g, '<span class="text-gray-400 italic px-1">$1</span>');
    
    return { __html: html };
  };

  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await generateNanoBananaImage(scene.image_prompt_nano_banana);
      onUpdate({ ...scene, generated_image_url: url });
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEditImageArabic = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await editNanoBananaImageText(scene.image_prompt_nano_banana, scene.generated_image_url || "");
      onUpdate({ ...scene, generated_image_url: url });
    } catch (err) {
      console.error(err);
      alert("Failed to edit image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRewriteSentence = async () => {
    if (!selectedSentence || !interactiveInstruction) return;
    try {
      setIsRewriting(true);
      const revised = await rewriteScript(selectedSentence, interactiveInstruction);
      const newVoiceOver = editedVoiceOver.replace(selectedSentence, revised);
      setEditedVoiceOver(newVoiceOver);
      onUpdate({ ...scene, voice_over: newVoiceOver });
      setSelectedSentence(null);
      setInteractiveInstruction("");
    } catch (e) {
      console.error(e);
      alert("Failed to rewrite.");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRegenerate = async () => {
    onUpdate({ ...scene, status: "regenerating" });
    setTimeout(() => {
      onUpdate({
        ...scene,
        visual_cue: scene.visual_cue + " (تم التحديث للتأكيد على الفكرة)",
        image_prompt_nano_banana: scene.image_prompt_nano_banana + " --v 6.0 --style raw",
        status: "pending"
      });
    }, 1500);
  };

  return (
    <div
      className={`bg-white border-2 border-[#1a1a1a] p-4 flex flex-col space-y-4 transition-all ${
        status === "approved" ? "shadow-[8px_8px_0_#15803d] border-[#15803d]" : "shadow-[8px_8px_0_#1a1a1a]"
      }`}
    >
      <div className="flex justify-between items-center border-b-2 border-[#1a1a1a] pb-2">
        <span className={`px-3 py-1 text-white font-bold text-lg border-2 border-[#1a1a1a] typewriter ${status === "approved" ? "bg-green-700" : "bg-[#1a1a1a]"}`}>
          {scene.asset_id} {status === "approved" && "✓"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadMp3}
            className="p-2 border-2 border-[#1a1a1a] text-xs font-bold bg-[#eae5d8] text-[#1a1a1a] active:bg-[#1a1a1a] active:text-white flex items-center justify-center gap-1"
            title="Download MP3 (Requires ElevenLabs Key)"
          >
            تحميل MP3
          </button>
          <button
            onClick={handlePlayTTS}
            className={`p-2 border-2 border-[#1a1a1a] flex gap-2 font-bold ${isPlayingTTS ? 'bg-red-600 text-white active:bg-red-800' : 'bg-yellow-400 text-[#1a1a1a] active:bg-yellow-600'}`}
            title="Teleprompter Voice Preview"
          >
            {isPlayingTTS ? <><Square className="w-5 h-5 fill-current" /> إيقاف</> : <><Volume2 className="w-5 h-5" /> اسمع البروفة</>}
          </button>
          <button
            onClick={() => copyToClipboard(scene.voice_over, "تم نسخ السكريبت")}
            className="p-2 border-2 border-[#1a1a1a] bg-[#f4eee0] text-[#1a1a1a] active:bg-[#1a1a1a] active:text-white"
            title="نسخ السكريبت"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedVoiceOver}
              onChange={(e) => setEditedVoiceOver(e.target.value)}
              className="w-full h-32 p-4 font-arabic-body text-xl leading-10 text-[#1a1a1a] bg-[#fdfdfd] border-2 border-[#1a1a1a] focus:outline-none focus:ring-0 resize-none"
              dir="rtl"
            />
          </div>
        ) : (
          <div className="font-arabic-body text-xl leading-10 text-[#1a1a1a] bg-[#fdfdfd] p-4 border border-dashed border-[#1a1a1a]">
            {editedVoiceOver.split(/([.؟!]+)/).map((sentence, idx) => {
              if (!sentence.trim()) return <span key={idx}>{sentence}</span>;
              const isSelected = selectedSentence === sentence;

              const formattedSentence = colorCodeScript(sentence);

              return (
                <span
                  key={idx}
                  onClick={() => setSelectedSentence(isSelected ? null : sentence)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-yellow-200 shadow-[2px_2px_0_#1a1a1a]' : 'hover:bg-gray-100'}`}
                  dangerouslySetInnerHTML={formattedSentence}
                />
              );
            })}
          </div>
        )}

        {selectedSentence && !isEditing && (
          <div className="bg-[#f0f0f0] p-4 border-2 border-yellow-400 flex flex-col gap-2">
            <label className="text-sm font-bold opacity-75">تعديل الجملة المحددة:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={interactiveInstruction} 
                onChange={(e) => setInteractiveInstruction(e.target.value)} 
                placeholder="مثلاً: اجعلها أقصر، أو حولها لسؤال مشوق..."
                className="flex-1 p-2 border-2 border-[#1a1a1a]"
                dir="rtl"
              />
              <button 
                onClick={handleRewriteSentence}
                disabled={isRewriting || !interactiveInstruction}
                className="bg-[#1a1a1a] text-white px-4 py-2 font-bold disabled:opacity-50"
              >
                {isRewriting ? "جاري التعديل..." : "نفذ"}
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#eae5d8] border-2 border-[#1a1a1a] font-bold mt-2"
        >
          {isExpanded ? (
            <><ChevronUp className="w-5 h-5" /> إخفاء تفاصيل المشهد الفنية</>
          ) : (
            <><ChevronDown className="w-5 h-5" /> إظهار تفاصيل المشهد الفنية (البرومبتات، المونتاج)</>
          )}
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {scene.visual_cue && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">الوصف البصري:</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.visual_cue}</span>
              </div>
            )}
            {scene.visual_motif && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🎞️ الموتيف البصري:</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.visual_motif}</span>
              </div>
            )}
            {scene.cinematic_movement && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🎥 اللقطة الحركية (B-Roll):</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.cinematic_movement}</span>
              </div>
            )}
            {scene.voiceover_notes && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🎙️ إرشادات الفويس أوفر:</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.voiceover_notes}</span>
              </div>
            )}
            {scene.sound_design && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🔊 الهندسة الصوتية:</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.sound_design}</span>
              </div>
            )}
            {scene.asmr_soundscape && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🎧 تصميم الـ ASMR (Lyria 3):</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.asmr_soundscape}</span>
              </div>
            )}
            {scene.music_prompt && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🎵 برومبت الموسيقى (Lyria 3):</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.music_prompt}</span>
              </div>
            )}
            {scene.sfx_prompt && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a]">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">🔊 برومبت المؤثرات (Lyria 3):</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.sfx_prompt}</span>
              </div>
            )}
            {scene.montage_instructions && (
              <div className="bg-[#f0f0f0] p-3 border border-[#1a1a1a] hidden">
                <strong className="text-[#8b0000] block mb-1 newspaper text-lg">المخرج:</strong>
                <span className="font-serif leading-relaxed text-sm">{scene.montage_instructions}</span>
              </div>
            )}
            {scene.b_roll_keywords && (
              <div className="bg-[#eae5d8] p-3 border border-[#1a1a1a] relative">
                <strong className="text-[#1a1a1a] block mb-1 underline">كلمات بحث (B-Roll):</strong>
                <div className="text-[#555] text-sm break-words">{scene.b_roll_keywords}</div>
              </div>
            )}
            {scene.image_prompt_nano_banana && (
              <div className="bg-[#eae5d8] p-3 border border-[#1a1a1a] relative flex flex-col gap-2 md:col-span-2">
                <strong className="text-[#1a1a1a] block mb-1 underline">برومبت الصور (Nano Banana):</strong>
                <div className="text-[#555] text-sm break-words">{scene.image_prompt_nano_banana}</div>
                
                {!scene.generated_image_url && (
                   <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="mt-2 bg-[#1a1a1a] text-white p-2 flex justify-center gap-2 items-center text-sm disabled:opacity-50">
                      <ImageIcon className="w-4 h-4" /> 
                      {isGeneratingImage ? "جاري التوليد..." : "توليد كادر المعاينة"}
                   </button>
                )}
                {scene.generated_image_url && (
                   <div className="mt-2 flex flex-col gap-2">
                     <div className="barwaz-frame">
                       <img src={scene.generated_image_url} alt="Scene Visual preview" className="w-full aspect-video object-cover" />
                       {scene.visual_cue && (
                         <div className="barwaz-text-overlay">
                           {scene.visual_cue.substring(0, 100)}...
                         </div>
                       )}
                     </div>
                     <button onClick={handleEditImageArabic} disabled={isGeneratingImage} className="bg-yellow-400 text-[#1a1a1a] p-2 flex justify-center gap-2 items-center text-sm disabled:opacity-50 border-2 border-[#1a1a1a]">
                        <Edit3 className="w-4 h-4" /> 
                        {isGeneratingImage ? "جاري المعالجة..." : "تعديل الصورة لضبط النصوص العربية"}
                     </button>
                   </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-[#1a1a1a]">
          <button 
            onClick={handleApprove}
            disabled={status === "approved" || isEditing}
            className={`flex-1 min-w-[120px] py-3 font-bold text-white border-2 border-[#1a1a1a] flex items-center justify-center gap-2 transition-colors ${
              status === "approved" ? "bg-green-800 opacity-50 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 active:bg-green-900"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {status === "approved" ? "معتمد" : "اعتماد المشهد"}
          </button>

          <button 
            onClick={handleEditToggle}
            className="flex-1 min-w-[120px] py-3 font-bold text-[#1a1a1a] bg-yellow-400 border-2 border-[#1a1a1a] hover:bg-yellow-500 active:bg-yellow-600 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            {isEditing ? "حفظ التعديل" : "تعديل السكريبت"}
          </button>

          <button 
            onClick={handleRegenerate}
            disabled={status === "regenerating" || isEditing}
            className={`flex-1 min-w-[120px] py-3 font-bold text-white border-2 border-[#1a1a1a] flex items-center justify-center gap-2 ${
              status === "regenerating" ? "bg-red-800 opacity-50 cursor-wait" : "bg-red-700 hover:bg-red-800 active:bg-red-900"
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${status === "regenerating" ? "animate-spin" : ""}`} />
            {status === "regenerating" ? "جاري..." : "تعديل الزاوية (AI)"}
          </button>
        </div>
      </div>
    </div>
  );
}
