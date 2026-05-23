import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mic, RotateCcw, FlipHorizontal, Play, Pause, Activity } from "lucide-react";

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
  const [isRecording, setIsRecording] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-EG';

      recognitionRef.current.onresult = (event: any) => {
        // Find total length of transcript to advance scroll loosely.
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Auto scroll down progressively with voice recognition
        if (scrollContainerRef.current) {
          // A very rudimentary sync: scroll based on perceived progression
          // For a robust one, we just gently scroll down on speech
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
    };
  }, []);

  const handleStart = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      setIsRecording(true);
      setCountdown(null);
      if (recognitionRef.current) {
        recognitionRef.current.start();
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
      className="fixed inset-0 z-[6000] bg-white text-gray-900 flex flex-col overflow-hidden"
    >
      <audio ref={audioRef} />

      {/* TOP CONTROLS */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
           {isRecording ? (
             <div className="flex items-center gap-3">
               <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]" />
               <span className="text-red-500 font-mono text-sm tracking-widest uppercase">Recording</span>
               <Activity className="w-5 h-5 text-gray-600 ml-2 animate-pulse" />
             </div>
           ) : (
             <button
               onClick={handleStart}
               className="bg-gray-100 active:scale-95 text-gray-900/80 px-6 py-3 rounded-full font-mono text-sm tracking-widest uppercase flex items-center gap-2 transition-all"
             >
               <Mic size={18} /> Start_Voice_Sync
             </button>
           )}
           
           {/* Soundboard */}
           <div className="flex gap-2 border-l border-gray-300 pl-6 ml-2">
             {SOUNDS.map(s => (
               <button
                 key={s.id}
                 onClick={() => toggleSound(s)}
                 className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wider border rounded-full transition-colors ${
                   activeSound === s.id ? 'bg-blue-600 text-black border-blue-500' : 'border-gray-300 text-gray-600 active:scale-95'
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
               isMirrored ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'border-gray-300 text-gray-600 active:scale-95'
             }`}
           >
             <FlipHorizontal size={16} /> Mirror_Mode
           </button>
           <button
             onClick={onClose}
             className="w-10 h-10 bg-gray-100 active:scale-95 rounded-full flex items-center justify-center transition-colors"
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
            className="absolute inset-0 flex items-center justify-center z-40 bg-white/80 backdrop-blur-sm"
          >
            <div className="text-[20vw] font-black text-blue-600 font-mono leading-none">
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
         <div className="absolute top-1/2 left-0 w-full border-t-2 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)] z-10 pointer-events-none" />
         
         <div 
           ref={scrollContainerRef}
           className="h-full w-full max-w-5xl overflow-y-auto no-scrollbar scroll-smooth"
           dir="rtl"
         >
           <div className="h-[40vh]" /> {/* Top padding for focus area */}
           <div 
              className="text-4xl lg:text-7xl font-arabic font-black leading-[2] text-gray-900/90 text-center mx-auto"
              dangerouslySetInnerHTML={{ __html: script.replace(/\n/g, '<br><br>') }}
           />
           <div className="h-[60vh]" /> {/* Bottom padding */}
         </div>
      </div>
    </motion.div>
  );
}
