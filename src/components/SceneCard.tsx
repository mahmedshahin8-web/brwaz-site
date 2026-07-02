import { apiFetch } from "../lib/apiFetch";
import React, { useState } from "react";
import { EpisodeScene } from "../types";
import { Copy, Edit2, RefreshCw, CheckCircle, Image as ImageIcon, Edit3, Volume2, Square, ChevronDown, ChevronUp, Archive, Mic, Play, Wand2, Zap, ExternalLink, Video, Music, Swords, X, Search, Camera, Waypoints, Scissors, Type } from "lucide-react";
import { toast } from "react-hot-toast";
import { surgicalEdit } from "../lib/gemini";
import { generateNanoBananaImage, editNanoBananaImageText } from "../services/imageService";
import { generateGrokVideo } from "../services/videoService";
import { AudioWaveform } from "./AudioWaveform";
import { motion, AnimatePresence } from "motion/react";
import { BRollModal } from "./BRollModal";
import { ImageWithFallback } from "./ImageWithFallback";
import { useCreatorStore } from "../store/useCreatorStore";

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
  onGenerateVariations?: () => void;
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
  isABTesting,
  onGenerateVariations
}: SceneCardProps) {
  const creatorMode = useCreatorStore((state) => state.creatorMode);
  const isVertical = creatorMode === "reels";
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVoiceOver, setEditedVoiceOver] = useState(scene.voice_over || "");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [interactiveInstruction, setInteractiveInstruction] = useState("");
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [showBrollModal, setShowBrollModal] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState<{show: boolean, top: number, left: number, start: number, end: number} | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const status = scene.status || "pending";

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target.selectionStart !== target.selectionEnd) {
       // get coordinates approx
       // We'll just show it near mouse cursor or simple fixed relative to textarea
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target.selectionStart !== target.selectionEnd) {
       const rect = target.getBoundingClientRect();
       setFloatingToolbar({
           show: true,
           top: Math.max(e.clientY - rect.top - 40, 0),
           left: e.clientX - rect.left,
           start: target.selectionStart,
           end: target.selectionEnd
       });
    } else {
       setFloatingToolbar(null);
    }
  };

  const insertTTSModifier = (modifier: string) => {
    if (!floatingToolbar) return;
    const { start, end } = floatingToolbar;
    const text = editedVoiceOver;
    const newText = text.substring(0, start) + modifier + text.substring(start, end) + (modifier.includes('[') ? '] ' : ' ') + text.substring(end);
    setEditedVoiceOver(newText);
    setFloatingToolbar(null);
  };

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
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
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
    html = html.replace(/(\[صمت درامي\]|🔊|\[.*?\])/g, '<span class="text-[#71717a] italic px-1">$1</span>');
    
    return { __html: html };
  };

  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await generateNanoBananaImage(scene.image_prompt || "", isVertical ? "9:16" : "16:9");
      onUpdate({ ...scene, generated_image_url: url });
    } catch (err) {
      console.error(err);
      alert("فشل في توليد الصورة.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateFirstFrame = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await generateNanoBananaImage(scene.first_frame_image_prompt || scene.image_prompt || "", isVertical ? "9:16" : "16:9");
      onUpdate({ ...scene, first_frame_url: url });
    } catch (err) {
      console.error(err);
      alert("فشل في توليد الإطار الأول.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateSecondFrame = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await generateNanoBananaImage(scene.second_frame_image_prompt || scene.image_prompt || "", isVertical ? "9:16" : "16:9");
      onUpdate({ ...scene, second_frame_url: url });
    } catch (err) {
      console.error(err);
      alert("فشل في توليد الإطار الثاني.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!scene.first_frame_url || !scene.second_frame_url) {
      alert("يجب توليد الإطار الأول والثاني قبل الربط بالفيديو.");
      return;
    }
    try {
      setIsGeneratingVideo(true);
      const videoUrl = await generateGrokVideo(
        scene.first_frame_url, 
        scene.second_frame_url, 
        scene.first_frame_motion_prompt || "Cinematic camera movement",
        isVertical ? "9:16" : "16:9"
      );
      onUpdate({ ...scene, generated_video_url: videoUrl });
      toast.success("تم توليد المشهد السينمائي بنجاح!");
    } catch (err) {
      console.error(err);
      alert("فشل في توليد الفيديو عبر محرك Grok.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleEditImageArabic = async () => {
    try {
      setIsGeneratingImage(true);
      const url = await editNanoBananaImageText(scene.image_prompt || "", scene.generated_image_url || "");
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
        image_prompt: (scene.image_prompt || "") + " --v 6.0 --style raw",
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
      className={`bg-[#121214]  rounded-xl shadow-sm p-8 flex flex-col space-y-6 transition-all duration-300 relative overflow-hidden border ${
        status === "approved" ? "border-green-200" : "border-[#27272a]"
      } ${isHighlighted ? "z-30 scale-[1.01]" : "active:scale-95"}`}
    >
      {scene.comparison_version && (
        <div className="absolute inset-0 z-[100] bg-[#121214] /95  flex flex-col p-6 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-8 border-b border-[#27272a] pb-4">
              <h3 className="text-xl font-arabic font-bold text-[#fafafa] flex items-center gap-3">
                 <Swords className="text-[#6366f1]" /> وضع المقارنة
              </h3>
              <button 
                onClick={() => onAcceptVersion?.("original")}
                className="text-[#71717a] active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {/* VERSION A: ORIGINAL */}
              <div className="space-y-6 p-6 border border-[#27272a] bg-[#27272a]/50 flex flex-col rounded-xl">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest">Version_A</span>
                    <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full ${(!scene.engine_source || scene.engine_source === 'gemini') ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-[#10B981] text-[#10B981]'}`}>
                       {(scene.engine_source || 'gemini').toUpperCase()}
                    </span>
                 </div>
                 <div className="flex-1 font-arabic text-lg leading-relaxed text-[#fafafa]/80 text-right h-40 overflow-y-auto no-scrollbar">
                    {scene.voice_over}
                 </div>
                 <div className="space-y-4 pt-4 mt-auto border-t border-[#27272a]">
                    <div className="text-[10px] font-arabic text-[#a1a1aa]">
                       <strong className="block text-[#a1a1aa] mb-1">الرؤية البصرية:</strong>
                       {scene.visual_cue}
                    </div>
                    <button 
                      onClick={() => onAcceptVersion?.("original")}
                      className="w-full py-3 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] text-[#fafafa] font-arabic font-bold active:scale-95 transition-all"
                    >
                      اعتماد النسخة A
                    </button>
                 </div>
              </div>

              {/* VERSION B: COMPARISON */}
              <div className="space-y-6 p-6 border border-[#4f46e5]/20 bg-[#4f46e5]/5 flex flex-col">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#4f46e5] uppercase tracking-widest">Version_B (New)</span>
                    <span className={`text-[8px] font-mono border px-2 py-0.5 rounded-full ${(scene.comparison_version.engine_source === 'ollama') ? 'border-[#10B981] text-[#10B981]' : 'border-[#3b82f6] text-[#3b82f6]'}`}>
                       {(scene.comparison_version.engine_source || 'ollama').toUpperCase()}
                    </span>
                 </div>
                 <div className="flex-1 font-arabic text-lg leading-relaxed text-[#fafafa] text-right h-40 overflow-y-auto no-scrollbar">
                    {scene.comparison_version.voice_over}
                 </div>
                 <div className="space-y-4 pt-4 mt-auto border-t border-[#27272a]">
                    <div className="text-[10px] font-arabic text-[#a1a1aa]">
                       <strong className="block text-[#a1a1aa] mb-1">الرؤية البصرية:</strong>
                       {scene.comparison_version.visual_cue}
                    </div>
                    <button 
                      onClick={() => onAcceptVersion?.("comparison")}
                      className="w-full py-3 bg-[#4f46e5] text-black font-arabic font-bold active:scale-95 shadow-blue-500/20 transition-all"
                    >
                      اعتماد النسخة B
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      <div className={`absolute top-0 right-0 w-1 h-full transition-colors rounded-r-xl ${isHighlighted ? 'bg-[#4f46e5]' : 'bg-transparent'}`}></div>
      
      <div className="flex justify-between items-center border-b border-[#27272a] pb-4 flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg ${status === "approved" ? "text-green-700 bg-green-50 border border-green-200" : "bg-[#27272a]/50 text-[#71717a] border border-[#27272a]"}`}>
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
                  : 'border border-[#4f46e5]/30 text-[#4f46e5] bg-[#121214]'
              } active:scale-95 active:scale-95`}
            >
              {scene.loop_type}
            </button>
          )}
          <span className="text-[10px] font-mono bg-[#27272a]/50 border border-[#27272a] rounded-lg px-2 py-1 text-[#71717a] uppercase">
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
          {onGenerateVariations && (
             <button
              onClick={onGenerateVariations}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border border-blue-500/30 text-blue-400 bg-blue-500/10 active:scale-95`}
             >
               <RefreshCw size={12} /> 
               توليد بدائل (Variations)
             </button>
          )}
          {onVSMode && !scene.comparison_version && (
             <button
              onClick={onVSMode}
              disabled={isABTesting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border border-[#27272a] text-[#71717a] active:scale-95 ${isABTesting ? 'opacity-50 cursor-wait' : ''}`}
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
                  ? 'border-red-200 bg-[#ef4444]/10 text-[#ef4444] animate-pulse' 
                  : 'border-[#27272a] text-[#71717a] active:scale-95 active:scale-95'
              }`}
            >
              {isRecording ? <><Square size={12} className="fill-current" /> Stop</> : <><Mic size={12} /> Rec</>}
            </button>
          )}
          <button
            onClick={handleDownloadMp3}
            className="px-3 py-1.5 rounded-lg border border-[#27272a] font-sans font-medium uppercase tracking-wider text-[10px] text-[#71717a] active:scale-95 transition-all"
            title="تحميل MP3 (يتطلب مفتاح ElevenLabs)"
          >
            MP3
          </button>
          <button
            onClick={handlePlayTTS}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium font-sans uppercase tracking-wider transition-all border ${isPlayingTTS ? 'border-red-200 bg-[#ef4444]/10 text-[#ef4444]' : 'border-[#27272a] text-[#71717a] active:scale-95 active:scale-95'}`}
          >
            {isPlayingTTS ? <><Square size={12} className="fill-current" /> Stop</> : <><Volume2 size={12} /> Play</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 relative z-10">
        {isEditing ? (
          <div className="relative">
             <div className="absolute top-2 left-4 text-[#71717a] text-xs font-sans uppercase">Editing...</div>
             <textarea
               ref={textAreaRef}
               value={editedVoiceOver}
               onChange={(e) => setEditedVoiceOver(e.target.value)}
               onSelect={handleTextareaSelect}
               onPointerUp={handlePointerUp}
               className="w-full h-48 p-6 bg-[#27272a]/50 border border-[#27272a] rounded-xl font-arabic text-xl leading-relaxed text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#4f46e5] resize-none"
               dir="rtl"
             />
             {floatingToolbar && floatingToolbar.show && (
                <div 
                  className="absolute z-50 flex gap-1 p-2 bg-[#27272a] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl"
                  style={{ top: Math.max(floatingToolbar.top, 30), left: Math.min(floatingToolbar.left, window.innerWidth - 300) }}
                >
                   <button onPointerDown={(e) => { e.preventDefault(); insertTTSModifier('[PAUSE_0.5s]'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg active:scale-95 font-mono">+ صمت</button>
                   <button onPointerDown={(e) => { e.preventDefault(); insertTTSModifier('[SPEED: FAST]'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg active:scale-95 font-mono">سريع</button>
                   <button onPointerDown={(e) => { e.preventDefault(); insertTTSModifier('[SPEED: SLOW]'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg active:scale-95 font-mono">بطيء</button>
                   <button onPointerDown={(e) => { e.preventDefault(); insertTTSModifier('[EMOTION: SAD]'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg active:scale-95 font-mono">حزين</button>
                   <button onPointerDown={(e) => { e.preventDefault(); insertTTSModifier('[EMOTION: EXCITED]'); }} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-xs rounded-lg active:scale-95 font-mono">حماسي</button>
                </div>
             )}
          </div>
        ) : (
          <div className="bg-[#121214]  p-8 border border-[#27272a] rounded-xl shadow-sm transition-all group/script relative">
            <div className="absolute top-4 left-6 text-[#71717a]/50 uppercase tracking-widest text-xs font-mono">SCENE TEXT</div>
            <div className="absolute top-4 right-6 opacity-0 group-hover/script:opacity-100 transition-opacity flex gap-2">
               <button onClick={handleEditToggle} className="text-[#71717a] hover:text-[#6366f1] active:scale-95 bg-[#27272a]/50 p-2 rounded-lg transition-colors"><Edit2 size={16} /></button>
               <button onClick={() => copyToClipboard(scene.voice_over)} className="text-[#71717a] hover:text-green-500 active:scale-95 bg-[#27272a]/50 p-2 rounded-lg transition-colors"><Copy size={16} /></button>
            </div>
            
            <div className={`mt-4 rounded-lg md:grid ${scene.archival_quotes && scene.archival_quotes.length > 0 ? "md:grid-cols-3 md:gap-8" : "md:grid-cols-1"}`}>
              {/* SCRIPT COLUMN (2/3 width on Desktop if quotes exist) */}
              <div className={`font-arabic text-2xl font-medium leading-[2.2] text-[#fafafa] text-right ${scene.archival_quotes && scene.archival_quotes.length > 0 ? "md:col-span-2" : ""}`}>
                {renderWords}
              </div>

              {/* ARCHIVE COLUMN (1/3 width on Desktop if quotes exist) */}
              {scene.archival_quotes && scene.archival_quotes.length > 0 && (
                 <div className="mt-8 md:mt-0 border-t md:border-t-0 md:border-r border-[#27272a] pt-6 md:pt-0 md:pr-6">
                   <h4 className="text-xs font-mono text-[#71717a] uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Archive className="w-4 h-4 text-amber-600" />
                     Archival Testimony
                   </h4>
                   <div className="flex flex-col gap-4">
                     {scene.archival_quotes.map((quote, idx) => (
                       <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 relative group/quote hover:shadow-medium transition-shadow">
                         <div className="text-amber-900 font-bold mb-2 flex items-center justify-between">
                           <span className="text-xs font-sans uppercase tracking-wider font-bold">{quote.speaker}</span>
                           {quote.is_audio_available && <span title="Audio/Video likely in Archives"><Mic className="w-4 h-4 text-green-600 hover:text-green-500 transition-colors cursor-help" /></span>}
                         </div>
                         <blockquote className="text-base font-arabic text-amber-800 italic pr-3 border-r-2 border-amber-300 pointer-events-none">
                           "{quote.quote_text}"
                         </blockquote>
                         {quote.source_context && (
                           <div className="mt-4 pt-2 border-t border-amber-100 text-[10px] text-amber-600/80 font-mono italic opacity-0 group-hover/quote:opacity-100 transition-opacity duration-300">
                             [SOURCE]: {quote.source_context}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
              )}
            </div>
          </div>
        )}

        {selectedSentence && !isEditing && (
          <div className="bg-[#121214] /20 p-4 border border-accent-warning rounded-none flex flex-col gap-4">
            <label className="text-sm font-['JetBrains_Mono'] tracking-tight text-text-muted">تعديل الجملة المحددة:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={interactiveInstruction} 
                onChange={(e) => setInteractiveInstruction(e.target.value)} 
                placeholder="مثلاً: اجعلها أقصر، أو حولها لسؤال مشوق..."
                className="flex-1 p-4 bg-bg-darker border border-[#27272a] rounded-none focus:outline-none focus:border-accent-warning text-[#fafafa]"
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
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#27272a]/50 border border-[#27272a] text-[#71717a] font-sans font-medium text-sm rounded-xl mt-4 active:scale-95 transition-colors"
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
              <div className="grid grid-cols-1 gap-4 mt-4 text-sm text-[#e5e3e0] bg-[#121214]  border border-[#27272a] p-6 rounded-xl shadow-sm">
                
                {(audioUrl || isRecording) && (
                  <div className="space-y-4 mb-6 pb-6 border-b border-[#27272a]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold text-[#71717a] uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3 text-[#6366f1]" /> Audio Engine
                        </h3>
                        {audioUrl && !scene.is_mastered && onMasterAudio && (
                          <button 
                            onClick={onMasterAudio}
                            className="text-xs font-mono text-[#6366f1] active:scale-95 transition-colors"
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
                   <h4 className="font-semibold text-[#fafafa] border-b border-[#27272a] pb-2 mb-4">التوجيهات الفنية (Technical Rules)</h4>
                   
                   {scene.visual_treatment && (
                     <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900">
                       <strong className="block text-xs uppercase tracking-wider text-amber-700 mb-1">Visual Treatment</strong>
                       <p className="font-medium">{scene.visual_treatment}</p>
                     </div>
                   )}
                   
                   {scene.multi_camera_angles && scene.multi_camera_angles.length > 0 && (
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
                       <strong className="block text-xs uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                         <Camera size={14} className="text-slate-400" /> Multi-Cam Director's Cuts
                       </strong>
                       <div className="space-y-3">
                         {scene.multi_camera_angles.map((cam, camIdx) => (
                           <div key={camIdx} className="bg-slate-900 border border-slate-700 p-3 rounded-md flex flex-col gap-1">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-800 px-2 py-0.5 rounded-full">{cam.type}</span>
                               <span className="text-[10px] font-mono text-cyan-400 border border-cyan-900 bg-cyan-950/30 px-2 py-0.5 rounded-full">{cam.lens}</span>
                             </div>
                             <p className="text-slate-300 text-sm mt-1">{cam.description}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {scene.visual_cue && (
                     <div className="bg-[#27272a]/50 p-4 rounded-lg border border-[#27272a]">
                       <strong className="block text-xs uppercase tracking-wider text-[#71717a] mb-1">Visual Cue</strong>
                       <p className="text-[#e5e3e0]">{scene.visual_cue}</p>
                     </div>
                   )}

                   {scene.montage_instructions && (
                     <div className="bg-[#4f46e5]/10 p-4 rounded-lg border border-[#4f46e5]/30">
                       <strong className="block text-xs uppercase tracking-wider text-[#818cf8] mb-1 flex items-center gap-2">
                         <Scissors size={14} /> 
                         تعليمات المونتاج (Daheeh Style)
                       </strong>
                       <p className="text-[#c7d2fe] font-arabic font-medium leading-relaxed">{scene.montage_instructions}</p>
                     </div>
                   )}

                   {scene.text_on_screen && (
                     <div className="bg-[#f59e0b]/10 p-4 rounded-lg border border-[#f59e0b]/30">
                       <strong className="block text-xs uppercase tracking-wider text-[#fbbf24] mb-1 flex items-center gap-2">
                         <Type size={14} /> 
                         Text On Screen (TOS)
                       </strong>
                       <p className="text-[#fcd34d] font-arabic font-bold text-lg leading-relaxed">{scene.text_on_screen}</p>
                     </div>
                   )}

                   {scene.pop_culture_meme_insert && (
                     <div className="bg-[#ec4899]/10 p-4 rounded-lg border border-[#ec4899]/30">
                       <strong className="block text-xs uppercase tracking-wider text-[#f472b6] mb-1 flex items-center gap-2">
                         <Video size={14} /> 
                         Pop Culture / Meme Insert
                       </strong>
                       <p className="text-[#fbcfe8] font-arabic font-medium leading-relaxed">{scene.pop_culture_meme_insert}</p>
                     </div>
                   )}

                   {scene.sound_design && (
                     <div className="bg-[#10b981]/10 p-4 rounded-lg border border-[#10b981]/30">
                       <strong className="block text-xs uppercase tracking-wider text-[#34d399] mb-1 flex items-center gap-2">
                         <Volume2 size={14} /> 
                         تصميم الصوت والمؤثرات (SFX)
                       </strong>
                       <p className="text-[#a7f3d0] font-arabic font-medium leading-relaxed">{scene.sound_design}</p>
                     </div>
                   )}

                   {scene.b_roll_search_query && (
                    <div className="bg-[#121214]/50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-xs uppercase tracking-wider text-[#6366f1]">اقتراح فيديو (بيكسلز)</strong>
                        <button 
                          onClick={() => setShowBrollModal(true)}
                          className="flex items-center gap-1.5 bg-[#27272a] active:scale-95 text-[#4f46e5] px-3 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors rounded-full"
                        >
                          <Search size={12} /> Search
                        </button>
                      </div>
                      <div className="text-blue-900 font-medium mb-3">Query: {scene.b_roll_search_query}</div>
                      {scene.pexelsAsset && (
                        <div className="relative rounded-lg overflow-hidden border border-[#4f46e5]/30 shadow-sm mt-3 h-48 group">
                           {scene.pexelsAsset.videoFiles && scene.pexelsAsset.videoFiles.length > 0 ? (
                             <video 
                               src={scene.pexelsAsset.videoFiles[0].link} 
                               poster={scene.pexelsAsset.image}
                               className="w-full h-full object-cover"
                               autoPlay loop muted playsInline
                             />
                           ) : (
                             <ImageWithFallback src={scene.pexelsAsset.image} alt={scene.b_roll_search_query || "B-Roll"} className="w-full h-full object-cover" />
                           )}
                           <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                              <a href={scene.pexelsAsset.url} target="_blank" rel="noreferrer" className="text-white text-xs block active:scale-95 transition-colors cursor-pointer">
                                  عرض في بيكسلز <ExternalLink size={12} className="inline ml-1" />
                              </a>
                           </div>
                        </div>
                      )}
                    </div>
                   )}
                   
                   {scene.sfx && (
                     <div className="bg-[#09090b] p-4 rounded-lg border border-gray-700">
                       <strong className="block text-xs uppercase tracking-wider text-[#71717a] mb-1">Sound Design (SFX)</strong>
                       <p className="text-gray-200">{scene.sfx}</p>
                     </div>
                   )}
                   
                   {/* GENERATED ASSET PREVIEW */}
                   <div className="space-y-6">
                   {scene.image_prompt && (
                      <div className="bg-[#27272a]/50 p-6 rounded-xl border border-[#27272a] relative">
                       <div className="flex justify-between items-start mb-4">
                         <strong className="text-xs uppercase tracking-wider text-[#71717a]">وصف الصورة للذكاء الاصطناعي (ميدجورني/نانو)</strong>
                         <button 
                           onClick={handleGenerateImage}
                           disabled={isGeneratingImage}
                           className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-arabic rounded-lg shadow-sm transition-colors active:scale-95"
                         >
                           <ImageIcon size={14} /> 
                           {isGeneratingImage ? "جاري التوليد..." : "توليد الستوري بورد"}
                         </button>
                       </div>
                        <p className="text-[#71717a] text-sm mb-4">{scene.image_prompt}</p>
                        
                        {scene.generated_image_url && (
                          <div className="relative rounded-lg overflow-hidden border border-[#27272a] shadow-sm h-48 mt-4">
                            <ImageWithFallback src={scene.generated_image_url} alt="Scene Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                   )}

                   {/* DUAL FRAME & VIDEO ENGINE */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* FIRST FRAME */}
                      <div className="bg-[#27272a]/50 p-6 rounded-xl border border-[#27272a]">
                        <div className="flex justify-between items-center mb-4">
                          <strong className="text-xs uppercase tracking-wider text-[#71717a]">First Frame (Start)</strong>
                          <button 
                             onClick={handleGenerateFirstFrame}
                             disabled={isGeneratingImage}
                             className="text-xs text-[#6366f1] active:scale-95 transition-colors"
                          >
                             {scene.first_frame_url ? "إعادة توليد" : "توليد فريم البداية"}
                          </button>
                        </div>
                        {scene.first_frame_url ? (
                          <div className="h-40 rounded-lg overflow-hidden border border-[#27272a] mb-3">
                             <ImageWithFallback src={scene.first_frame_url} alt="First Frame" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-40 rounded-lg bg-[#121214] border border-[#27272a] border-dashed flex items-center justify-center text-[#71717a] text-xs mb-3">
                             No Frame Generated
                          </div>
                        )}
                        <div className="text-[10px] text-[#71717a] italic">
                          {(scene.first_frame_motion_prompt || "").toUpperCase() === "STATIC" || (scene.first_frame_motion_prompt || "").includes("B-ROLL ARCHIVE") ? "State" : "Motion"}: {scene.first_frame_motion_prompt || "N/A"}
                        </div>
                      </div>

                      {/* SECOND FRAME */}
                      <div className="bg-[#27272a]/50 p-6 rounded-xl border border-[#27272a]">
                        <div className="flex justify-between items-center mb-4">
                          <strong className="text-xs uppercase tracking-wider text-[#71717a]">Second Frame (End)</strong>
                          <button 
                             onClick={handleGenerateSecondFrame}
                             disabled={isGeneratingImage}
                             className="text-xs text-[#6366f1] active:scale-95 transition-colors"
                          >
                             {scene.second_frame_url ? "إعادة توليد" : "توليد فريم النهاية"}
                          </button>
                        </div>
                        {scene.second_frame_url ? (
                          <div className="h-40 rounded-lg overflow-hidden border border-[#27272a] mb-3">
                             <ImageWithFallback src={scene.second_frame_url} alt="Second Frame" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-40 rounded-lg bg-[#121214] border border-[#27272a] border-dashed flex items-center justify-center text-[#71717a] text-xs mb-3">
                             No Frame Generated
                          </div>
                        )}
                        <div className="text-[10px] text-[#71717a] italic">
                          {(scene.second_frame_motion_prompt || "").toUpperCase() === "STATIC" || (scene.second_frame_motion_prompt || "").includes("B-ROLL ARCHIVE") ? "State" : "Motion"}: {scene.second_frame_motion_prompt || "N/A"}
                        </div>
                      </div>
                   </div>

                   {/* CINEMATIC GENERATOR BENTO */}
                   <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#6366f1]/30 to-[#facc15]/30 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative bg-[#27272a] p-6 rounded-2xl border border-[#6366f1]/20">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                               <h3 className="text-sm font-bold text-[#fafafa] mb-1">Grok Video Engine 1.5 Preview</h3>
                               <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-mono">
                                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 720p HD READY
                                  </div>
                                  <div className="text-[10px] text-[#71717a] font-mono">24 FPS / 16:9</div>
                               </div>
                            </div>
                            <button 
                               onClick={handleGenerateVideo}
                               disabled={isGeneratingVideo || !scene.first_frame_url || !scene.second_frame_url}
                               className="bg-[#6366f1] hover:bg-[#4f46e5] text-black px-6 py-2 rounded-lg font-bold text-sm shadow-xl shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                            >
                               {isGeneratingVideo ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                               {isGeneratingVideo ? "جاري التحريك..." : "توليد المشهد السينمائي"}
                            </button>
                         </div>

                         {scene.generated_video_url ? (
                           <div className={`${isVertical ? "aspect-[9/16] max-w-[280px]" : "aspect-video"} bg-black rounded-lg overflow-hidden border border-[#6366f1]/40 group/vid relative mx-auto`}>
                              <video 
                                src={scene.generated_video_url} 
                                controls 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-4 right-4 bg-black/60  px-3 py-1 rounded-full border border-white/10 text-[10px] text-white opacity-0 group-hover/vid:opacity-100 transition-opacity">
                                GROK_XAI_GEN_720P
                              </div>
                           </div>
                         ) : (
                           <div className={`${isVertical ? "aspect-[9/16] max-w-[280px] py-16" : "aspect-video"} bg-[#121214] rounded-lg border border-[#27272a] border-dashed flex flex-col items-center justify-center text-[#71717a] space-y-3 mx-auto w-full`}>
                              <Video size={40} className="text-[#27272a]" />
                              <p className="text-xs">اضبط الفريمات ثم اطلب التحريك السينمائي</p>
                           </div>
                         )}

                         {scene.transition_to_next_scene && (
                           <div className="mt-6 flex items-center gap-3 p-4 bg-[#121214] rounded-xl border border-[#27272a]">
                              <Waypoints className="text-[#4f46e5]" size={16} />
                              <div className="flex-1">
                                 <div className="text-[10px] text-[#71717a] uppercase font-mono tracking-widest">SMART_CHAIN_LOGIC</div>
                                 <div className="text-xs text-[#fafafa] font-bold">
                                    {scene.transition_to_next_scene === 'Match Cut' || scene.transition_to_next_scene === 'Same Scene' 
                                      ? "🔗 ربط ذكي مفعّل: تم سحب إطار البراز من المشهد السابق"
                                      : "✂️ قطع صلب: مشهد جديد تماماً بإطارات مستقلة"}
                                 </div>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
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
              status === "approved" ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200" : "bg-green-500 active:scale-95 text-[#fafafa] border-none"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {status === "approved" ? "معتمد" : "اعتماد المشهد"}
          </button>

          <button 
            onClick={handleEditToggle}
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
              isEditing ? "bg-[#4f46e5] active:scale-95 text-[#fafafa]" : "bg-amber-400 active:scale-95 text-amber-950"
            }`}
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? "حفظ التعديل" : "تعديل السكريبت"}
          </button>

          <button 
            onClick={handleRegenerate}
            disabled={status === "regenerating" || isEditing}
            className={`flex-1 min-w-[120px] py-3 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm ${
              status === "regenerating" ? "bg-red-100 text-[#ef4444] cursor-wait" : "bg-red-500 active:scale-95 text-[#fafafa]"
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
