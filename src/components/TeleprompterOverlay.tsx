import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic, RotateCcw, FlipHorizontal, Play, Pause, Activity, FastForward, Rewind } from "lucide-react";

interface Props {
  script: string;
  onClose: () => void;
}

// Soundboard presets
const SOUNDS = [
  { id: "drone", label: "Suspense Drone", src: "https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg" },
  { id: "heartbeat", label: "Heartbeat", src: "https://actions.google.com/sounds/v1/human_voices/heartbeat.ogg" },
  { id: "typewriter", label: "Typewriter", src: "https://actions.google.com/sounds/v1/office/typewriter_typing_fast.ogg" }
];

export function TeleprompterOverlay({ script, onClose }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isتسجيل, setIsتسجيل] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  
  // Auto-scroll state
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-EG';

      recognitionRef.current.onresult = (event: any) => {
        // Auto scroll down progressively with voice recognition
        if (scrollContainerRef.current && !isPlaying) { // Don't conflict with manual scroll
          scrollContainerRef.current.scrollBy({ top: 50, behavior: 'smooth' });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Handle continuous scrolling
  useEffect(() => {
    if (isPlaying && scrollContainerRef.current) {
      const scrollStep = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += scrollSpeed;
        }
        animationFrameRef.current = requestAnimationFrame(scrollStep);
      };
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, scrollSpeed]);

  const handleStartVoiceSync = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      setIsتسجيل(true);
      setCountdown(null);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }
  }, [countdown]);

  const toggleSound = (sound: typeof SOUNDS[0]) => {
    if (activeSound === sound.id) {
       audioRef.current?.pause();
       setActiveSound(null);
    } else {
       if (audioRef.current) {
          audioRef.current.src = sound.src;
          audioRef.current.loop = true;
          audioRef.current.play();
       }
       setActiveSound(sound.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[6000] bg-[#121214]  text-[#fafafa] flex flex-col overflow-hidden"
    >
      <audio ref={audioRef} />

      {/* TOP CONTROLS */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-[#121214] /80 backdrop-blur border-b border-[#27272a]">
        <div className="flex items-center gap-6">
           
           {/* Auto-scroll controls */}
           <div className="flex items-center gap-2 bg-[#121214] p-1 rounded-full">
             <button
                onClick={() => setScrollSpeed(s => Math.max(0.5, s - 0.5))}
                className="w-10 h-10 flex items-center justify-center text-[#71717a] hover:text-[#fafafa] active:scale-95 transition-all"
             >
               <Rewind size={16} />
             </button>
             <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-[#4f46e5] text-white rounded-full flex items-center justify-center active:scale-95 transition-all shadow-medium"
             >
               {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
             </button>
             <button
                onClick={() => setScrollSpeed(s => Math.min(5, s + 0.5))}
                className="w-10 h-10 flex items-center justify-center text-[#71717a] hover:text-[#fafafa] active:scale-95 transition-all"
             >
               <FastForward size={16} />
             </button>
             <div className="px-3 font-arabic text-xs text-[#71717a] font-bold border-l border-[#4f46e5]/30">
               {scrollSpeed.toFixed(1)}x
             </div>
           </div>

           {/* Voice Sync */}
           {!isPlaying && (
             <React.Fragment>
               {isتسجيل ? (
                 <div className="flex items-center gap-3 ml-4">
                   <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
                   <span className="text-[#ef4444] font-medium text-sm">تسجيل</span>
                   <Activity className="w-5 h-5 text-[#a1a1aa] ml-2 animate-pulse" />
                 </div>
               ) : (
                 <button
                   onClick={handleStartVoiceSync}
                   className="ml-4 bg-[#121214] active:scale-95 text-[#fafafa]/80 px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all"
                 >
                   <Mic size={18} /> Start_Voice_Sync
                 </button>
               )}
             </React.Fragment>
           )}
           
           {/* Soundboard */}
           <div className="hidden lg:flex gap-2 border-l border-[#4f46e5]/30 pl-6 ml-2">
             {SOUNDS.map(s => (
               <button
                 key={s.id}
                 onClick={() => toggleSound(s)}
                 className={`px-3 py-1 text-[10px]  font-arabic tracking-wider border rounded-full transition-colors ${
                   activeSound === s.id ? 'bg-[#4f46e5] text-white border-[#4f46e5]' : 'border-[#4f46e5]/30 text-[#a1a1aa] active:scale-95'
                 }`}
               >
                 {s.label}
               </button>
             ))}
           </div>
        </div>

        <div className="flex gap-4">
           <button
             onClick={() => setIsMirrored(p => !p)}
             className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors ${
               isMirrored ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500 font-bold' : 'border-[#4f46e5]/30 text-[#a1a1aa] active:scale-95'
             }`}
           >
             <FlipHorizontal size={16} /> <span className="hidden sm:inline">Mirror_Mode</span>
           </button>
           <button
             onClick={onClose}
             className="w-10 h-10 bg-[#121214] active:scale-95 rounded-full flex items-center justify-center transition-colors hover:bg-[#27272a]"
           >
             <X size={20} />
           </button>
        </div>
      </div>

      {/* COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-[#121214] /80 backdrop-blur-sm"
          >
            <div className="text-[20vw] font-black text-[#4f46e5] font-arabic leading-none">
              {countdown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TELEPROMPTER TEXT */}
      <div 
        className="flex-1 flex flex-col justify-center items-center py-32 px-10 relative overflow-hidden" 
        style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
      >
         <div className="absolute top-[40%] left-0 w-full border-t border-red-500 w-full z-10 pointer-events-none before:content-[''] before:absolute before:-top-[20px] before:-left-0 before:w-full before:h-[20px] before:bg-gradient-to-t before:from-red-500/10 before:to-transparent" />
         
         <div 
           ref={scrollContainerRef}
           className="h-[100vh] w-full max-w-5xl overflow-y-auto no-scrollbar scroll-smooth relative z-0 pt-[40vh]"
           dir="rtl"
         >
           <div 
              className="text-4xl sm:text-5xl lg:text-7xl font-arabic font-black leading-[1.8] text-[#fafafa]/90 text-center mx-auto"
              dangerouslySetInnerHTML={{ __html: script.replace(/\n/g, '<br><br>') }}
           />
           <div className="h-[60vh]" /> {/* Bottom padding */}
         </div>
      </div>
    </motion.div>
  );
}
