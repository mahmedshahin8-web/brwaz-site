import { apiFetch } from "../lib/apiFetch";
import React, { useState } from "react";
import { EpisodeScene } from "../types";
import { Copy, Edit2, RefreshCw, CheckCircle, Image as ImageIcon, Edit3, Volume2, Square, ChevronDown, ChevronUp, Archive, Mic, Play, Wand2, Zap, ExternalLink, Video, Music, Swords, X, Search } from "lucide-react";
import { surgicalEdit } from "../lib/gemini";
import { generateNanoBananaImage, editNanoBananaImageText } from "../services/imageService";
import { AudioWaveform } from "./AudioWaveform";
import { motion, AnimatePresence } from "motion/react";
import { BRollModal } from "./BRollModal";
import { ImageWithFallback } from "./ImageWithFallback";

interface SceneCardProps {
  key?: React.Key;
  scene: EpisodeScene;
  onUpdate: (updatedScene: EpisodeScene) => void;
  copyToClipboard: (text: string, message?: string) => void;
  isDraggable?: boolean; 
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onMasterAudio?: () => void;
  audioUrl?: string;
  onSeek?: (time: number) => void;
  seekTo?: number;
  isHighlighted?: boolean;
  onLoopClick?: (loopId: string) => void;
  // Missing Props
  isOpening?: boolean;
  onRecord?: () => void;
  onMaster?: () => void;
  isProcessingAudio?: boolean;
  onVSMode?: () => void;
  onAcceptVersion?: (version: "original" | "comparison") => void;
  isABTesting?: boolean;
}

export const SceneCard = React.memo(function SceneCard({ 
  scene, 
  onUpdate, 
  copyToClipboard, 
  isDraggable,
  isRecording,
  onStartRecording,
  onStopRecording,
  onMasterAudio,
  audioUrl,
  onSeek,
  seekTo,
  isHighlighted,
  onLoopClick,
  isOpening,
  onRecord,
  onMaster,
  isProcessingAudio,
  onVSMode,
  onAcceptVersion,
  isABTesting
}: SceneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoiceOver, setEditedVoiceOver] = useState(scene.voice_over || "");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [interactiveInstruction, setInteractiveInstruction] = useState("");
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [showBrollModal, setShowBrollModal] = useState(false);
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
        const res = await apiFetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}?output_format=mp3_44100_128`, {
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

  const handleOpenSearch = (platform: string, query: string) => {
    let url = "";
    if (platform === "pexels") url = `https://www.pexels.com/search/${encodeURIComponent(query)}`;
    if (platform === "mixkit") url = `https://mixkit.co/free-stock-video/${encodeURIComponent(query).replace(/%20/g, "-")}/`;
    if (platform === "freesound") url = `https://freesound.org/search/?q=${encodeURIComponent(query)}`;
    
    if (url) window.open(url, "_blank");
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

      const res = await apiFetch(`https://api.elevenlabs.io/v1/text-to-speech/${elVoiceId}?output_format=mp3_44100_128`, {
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
      if (!res.ok) throw new Error("خطأ في المفتاح أو تجاوز الحد الأقصى للاستخدام");
      
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
      alert("فشل في توليد الصورة.");
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
      alert("فشل في تعديل الصورة.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRewriteSentence = async () => {
    if (!selectedSentence || !interactiveInstruction) return;
    try {
      setIsRewriting(true);
      const revised = await surgicalEdit(selectedSentence, interactiveInstruction, editedVoiceOver);
      const newVoiceOver = editedVoiceOver.replace(selectedSentence, revised);
      setEditedVoiceOver(newVoiceOver);
      onUpdate({ ...scene, voice_over: newVoiceOver });
      setSelectedSentence(null);
      setInteractiveInstruction("");
    } catch (e) {
      console.error(e);
      alert("فشلت عملية النحت الجراحي.");
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

  const renderWords = React.useMemo(() => {
    return (editedVoiceOver || "").split(" ").map((word, idx) => {
      const cleanWord = word.replace(/[^\w\u0621-\u064A]/g, "");
      const timestamp = scene.word_timestamps?.find(t => t.word === cleanWord);
      const formattedWord = colorCodeScript(word + " ");
      
      return (
        <span
          key={idx}
          onDoubleClick={() => timestamp && onSeek && onSeek(timestamp.start)}
          className={`cursor-pointer transition-all border-b border-transparent active:scale-95 ${timestamp ? 'border-amber-500/20 text-amber-900' : ''}`}
          dangerouslySetInnerHTML={formattedWord}
        />
      );
    });
  }, [editedVoiceOver, scene.word_timestamps, onSeek]);

  return (
    <motion.div
      whileTap={{ scale: 0.995, transition: { duration: 0.05 } }}
      animate={{ 
        boxShadow: isHighlighted ? "0 4px 20px rgba(59, 130, 246, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
        borderColor: isHighlighted ? "rgba(59, 130, 246, 0.4)" : "rgba(229, 231, 235, 1)"
      }}
      transition={{ duration: 0.8, repeat: isHighlighted ? Infinity : 0, repeatType: "reverse" }}
      className={`bg-white rounded-xl shadow-sm p-8 flex flex-col space-y-6 transition-all duration-300 relative overflow-hidden border ${
        status === "approved" ? "border-green-200" : "border-gray-200"
      } ${isHighlighted ? "z-30 scale-[1.01]" : "active:scale-95"}`}
    >
      {scene.comparison_version && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
              <h3 className="text-xl font-arabic font-bold text-gray-900 flex items-center gap-3">
                 <Swords className="text-blue-500" /> وضع المقارنة
              </h3>
              <button 
                onClick={() => onAcceptVersion?.("original")}
                className="text-gray-400 active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {/* VERSION A: ORIGINAL */}
              <div className="space-y-6 p-6 border border-gray-200 bg-gray-50 flex flex-col rounded-xl">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Version_A</span>
                    <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full ${(!scene.engine_source || scene.engine_source === 'gemini') ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-[#10B981] text-[#10B981]'}`}>
                       {(scene.engine_source || 'gemini').toUpperCase()}
                    </span>
                 </div>
                 <div className="flex-1 font-arabic text-lg leading-relaxed text-gray-900/80 text-right h-40 overflow-y-auto no-scrollbar">
                    {scene.voice_over}
                 </div>
                 <div className="space-y-4 pt-4 mt-auto border-t border-gray-200">
                    <div className="text-[10px] font-arabic text-gray-600">
                       <strong className="block text-gray-600 mb-1">الرؤية البصرية:</strong>
                       {scene.visual_cue}
                    </div>
                    <button 
                      onClick={() => onAcceptVersion?.("original")}
                      className="w-full py-3 bg-white border-gray-100 shadow-sm border border-gray-200 text-gray-900 font-arabic font-bold active:scale-95 transition-all"
                    >
                      اعتماد النسخة A
                    </button>
                 </div>
              </div>

              {/* VERSION B: COMPARISON */}
              <div className="space-y-6 p-6 border border-blue-500/20 bg-blue-600/5 flex flex-col">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest">Version_B (New)</span>
                    <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full ${(scene.comparison_version.engine_source === 'ollama') ? 'border-[#10B981] text-[#10B981]' : 'border-[#3b82f6] text-[#3b82f6]'}`}>
                       {(scene.comparison_version.engine_source || 'ollama').toUpperCase()}
                    </span>
                 </div>
                 <div className="flex-1 font-arabic text-lg leading-relaxed text-gray-900 text-right h-40 overflow-y-auto no-scrollbar">
                    {scene.comparison_version.voice_over}
                 </div>
                 <div className="space-y-4 pt-4 mt-auto border-t border-gray-200">
                    <div className="text-[10px] font-arabic text-gray-600">
                       <strong className="block text-gray-600 mb-1">الرؤية البصرية:</strong>
                       {scene.comparison_version.visual_cue}
                    </div>
                    <button 
                      onClick={() => onAcceptVersion?.("comparison")}
                      className="w-full py-3 bg-blue-600 text-black font-arabic font-bold active:scale-95 shadow-blue-500/20 transition-all"
                    >
                      اعتماد النسخة B
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      <div className={`absolute top-0 right-0 w-1 h-full transition-colors rounded-r-xl ${isHighlighted ? 'bg-blue-500' : 'bg-transparent'}`}></div>
      
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg ${status === "approved" ? "text-green-700 bg-green-50 border border-green-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
            NODE_{scene.asset_id.replace(/\D/g, "") || "00"} {status === "approved" && "✓"}
          </span>
          {scene.loop_type && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (scene.loop_id && onLoopClick) onLoopClick(scene.loop_id);
              }}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono font-black transition-all shadow-sm ${
                scene.loop_type === 'O' 
                  ? 'border border-orange-200 text-orange-600 bg-orange-50' 
                  : 'border border-blue-200 text-blue-600 bg-blue-50'
              } active:scale-95 active:scale-95`}
            >
              {scene.loop_type}
            </button>
          )}
          <span className="text-[10px] font-mono bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-500 uppercase">
             EST_DUR: {scene.estimated_duration_seconds || Math.ceil((scene.voice_over?.length || 100) / 15)}s
          </span>
        </div>
        
        {scene.visual_treatment && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1">
             <Video size={12} className="text-amber-500" />
             <span className="font-sans font-semibold text-amber-700 uppercase text-[10px] pl-1 tracking-wider">Treatment: {scene.visual_treatment}</span>
          </div>
        )}

        <div className="flex gap-2">
          {onVSMode && !scene.comparison_version && (
             <button
              onClick={onVSMode}
              disabled={isABTesting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border border-gray-200 text-gray-500 active:scale-95 ${isABTesting ? 'opacity-50 cursor-wait' : ''}`}
             >
               {isABTesting ? <RefreshCw size={12} className="animate-spin" /> : <Swords size={12} />} 
               VS Mode
             </button>
          )}
          {(onStartRecording || onRecord) && (
            <button
              onClick={isRecording ? onStopRecording : (onRecord || onStartRecording)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border ${
                isRecording 
                  ? 'border-red-200 bg-red-50 text-red-600 animate-pulse' 
                  : 'border-gray-200 text-gray-500 active:scale-95 active:scale-95'
              }`}
            >
              {isRecording ? <><Square size={12} className="fill-current" /> Stop</> : <><Mic size={12} /> Rec</>}
            </button>
          )}
          <button
            onClick={handleDownloadMp3}
            className="px-3 py-1.5 rounded-lg border border-gray-200 font-sans font-medium uppercase tracking-wider text-[10px] text-gray-500 active:scale-95 transition-all"
            title="تحميل MP3 (يتطلب مفتاح ElevenLabs)"
          >
            MP3
          </button>
          <button
            onClick={handlePlayTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border ${isPlayingTTS ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500 active:scale-95 active:scale-95'}`}
          >
            {isPlayingTTS ? <><Square size={12} className="fill-current" /> Stop</> : <><Volume2 size={12} /> Play</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 relative z-10">
        {isEditing ? (
          <div className="relative">
             <div className="absolute top-2 left-4 text-gray-400 text-xs font-sans uppercase">Editing...</div>
             <textarea
               value={editedVoiceOver}
               onChange={(e) => setEditedVoiceOver(e.target.value)}
               className="w-full h-48 p-6 bg-gray-50 border border-gray-200 rounded-xl font-arabic text-xl leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
               dir="rtl"
             />
          </div>
        ) : (
          <div className="bg-white p-8 border border-gray-100 rounded-xl shadow-sm transition-all group/script active:scale-95 relative">
            <div className="absolute top-4 left-6 text-gray-300 uppercase tracking-widest text-xs font-mono">SCENE TEXT</div>
            <div className="absolute top-4 right-6 opacity-0 group-hover/script:opacity-100 transition-opacity flex gap-2">
               <button onClick={handleEditToggle} className="text-gray-400 active:scale-95 bg-gray-50 p-2 rounded-lg"><Edit2 size={16} /></button>
               <button onClick={() => copyToClipboard(scene.voice_over)} className="text-gray-400 active:scale-95 bg-gray-50 p-2 rounded-lg"><Copy size={16} /></button>
            </div>
            
            <div className="font-arabic text-2xl font-medium leading-[2.2] text-gray-800 text-right mt-4 rounded-lg">
              {renderWords}
            </div>
          </div>
        )}

        {selectedSentence && !isEditing && (
          <div className="bg-white/20 p-4 border border-accent-warning rounded-none flex flex-col gap-4">
            <label className="text-sm font-['JetBrains_Mono'] tracking-tight text-text-muted">تعديل الجملة المحددة:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={interactiveInstruction} 
                onChange={(e) => setInteractiveInstruction(e.target.value)} 
                placeholder="مثلاً: اجعلها أقصر، أو حولها لسؤال مشوق..."
                className="flex-1 p-4 bg-bg-darker border border-gray-200 rounded-none focus:outline-none focus:border-accent-warning text-gray-900"
                dir="rtl"
              />
              <button 
                onClick={handleRewriteSentence}
                disabled={isRewriting || !interactiveInstruction}
                className="bg-accent-warning text-bg-darker active:bg-yellow-500 px-6 py-2 font-['JetBrains_Mono'] tracking-tight rounded-none disabled:opacity-50 transition-colors"
              >
                {isRewriting ? "[RE-ENGAGING] // المعالجة جارية..." : "[ENGAGE] // نفذ"}
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-500 font-sans font-medium text-sm rounded-xl mt-4 active:scale-95 transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp className="w-4 h-4" /> إخفاء تفاصيل المشهد الفنية</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> إظهار التفاصيل والإعدادات الفنية</>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 mt-4 text-sm text-gray-700 bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                
                {(audioUrl || isRecording) && (
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3 text-blue-500" /> Audio Engine
                        </h3>
                        {audioUrl && !scene.is_mastered && onMasterAudio && (
                          <button 
                            onClick={onMasterAudio}
                            className="text-xs font-mono text-blue-500 active:scale-95 transition-colors"
                          >
                              Run Studio Polish
                          </button>
                        )}
                    </div>
                    <AudioWaveform 
                      audioUrl={audioUrl || ""} 
                      isRecording={isRecording} 
                      onMaster={onMasterAudio}
                      seekTo={seekTo} 
                    />
                  </div>
                )}

                {/* VISUAL & MONTAGE RULES */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">التوجيهات الفنية (Technical Rules)</h4>
                   
                   {scene.visual_treatment && (
                     <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900">
                       <strong className="block text-xs uppercase tracking-wider text-amber-700 mb-1">Visual Treatment</strong>
                       <p className="font-medium">{scene.visual_treatment}</p>
                     </div>
                   )}
                   
                   {scene.visual_cue && (
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                       <strong className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Visual Cue</strong>
                       <p className="text-gray-700">{scene.visual_cue}</p>
                     </div>
                   )}

                   {scene.b_roll_search_query && (
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-xs uppercase tracking-wider text-blue-500">Pexels Stock Suggestion</strong>
                        <button 
                          onClick={() => setShowBrollModal(true)}
                          className="flex items-center gap-1.5 bg-blue-100 active:scale-95 text-blue-700 px-3 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors rounded-full"
                        >
                          <Search size={12} /> Search
                        </button>
                      </div>
                      <div className="text-blue-900 font-medium mb-3">Query: {scene.b_roll_search_query}</div>
                      {scene.pexelsAsset && (
                        <div className="relative rounded-lg overflow-hidden border border-blue-200 shadow-sm mt-3 h-48">
                           <ImageWithFallback src={scene.pexelsAsset.image} alt={scene.b_roll_search_query || "B-Roll"} className="w-full h-full" />
                           <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                              <a href={scene.pexelsAsset.url} target="_blank" rel="noreferrer" className="text-white text-xs block active:scale-95 transition-colors cursor-pointer">
                                 View on Pexels <ExternalLink size={12} className="inline ml-1" />
                              </a>
                           </div>
                        </div>
                      )}
                    </div>
                   )}
                   
                   {scene.sfx && (
                     <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                       <strong className="block text-xs uppercase tracking-wider text-gray-400 mb-1">Sound Design (SFX)</strong>
                       <p className="text-gray-200">{scene.sfx}</p>
                     </div>
                   )}
                   
                   {/* GENERATED ASSET PREVIEW */}
                   {scene.image_prompt_nano_banana && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <strong className="block text-xs uppercase tracking-wider text-gray-400 mb-2">AI Image Prompt (Nano Banana)</strong>
                        <p className="text-gray-500 text-sm mb-4">{scene.image_prompt_nano_banana}</p>
                        
                        {scene.generated_image_url && (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm h-48">
                            <ImageWithFallback src={scene.generated_image_url} alt="Scene Preview" className="w-full h-full" />
                          </div>
                        )}
                      </div>
                   )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-wrap gap-4 pt-2">
          <button 
            onClick={handleApprove}
            disabled={status === "approved" || isEditing}
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
              status === "approved" ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200" : "bg-green-500 active:scale-95 text-gray-900 border-none"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {status === "approved" ? "معتمد" : "اعتماد المشهد"}
          </button>

          <button 
            onClick={handleEditToggle}
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
              isEditing ? "bg-blue-500 active:scale-95 text-gray-900" : "bg-amber-400 active:scale-95 text-amber-950"
            }`}
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "حفظ التعديل" : "تعديل السكريبت"}
          </button>

          <button 
            onClick={handleRegenerate}
            disabled={status === "regenerating" || isEditing}
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
              status === "regenerating" ? "bg-red-100 text-red-500 cursor-wait" : "bg-red-500 active:scale-95 text-gray-900"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${status === "regenerating" ? "animate-spin" : ""}`} />
            {status === "regenerating" ? "جاري الإعادة..." : "الكاتب الآلي (تعديل)"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBrollModal && scene.b_roll_keywords && (
          <BRollModal 
            keyword={scene.b_roll_keywords}
            onClose={() => setShowBrollModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});
