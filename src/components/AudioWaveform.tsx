
import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Headphones, Zap, Volume2, Maximize2, Mic, Play, Square, Scissors, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AudioWaveformProps {
  audioUrl: string;
  onRegionChange?: (start: number, end: number) => void;
  onMaster?: () => void;
  isRecording?: boolean;
  seekTo?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  audioUrl, 
  onRegionChange, 
  onMaster,
  isRecording,
  seekTo
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (wavesurferRef.current && typeof seekTo === "number" && duration > 0) {
      const progress = seekTo / duration;
      wavesurferRef.current.seekTo(Math.min(0.999, Math.max(0, progress)));
    }
  }, [seekTo, duration]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(34, 211, 238, 0.1)",
      progressColor: "#22d3ee", // Cyan Neon
      cursorColor: "#22d3ee",
      barWidth: 2,
      barGap: 3,
      height: 120,
      normalize: true,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());

    ws.on("decode", () => {
      setDuration(ws.getDuration());
    });

    ws.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    // Enable region selection
    regions.enableDragSelection({
      color: "rgba(34, 211, 238, 0.05)",
    });

    regions.on("region-updated", (region) => {
      onRegionChange?.(region.start, region.end);
    });

    ws.load(audioUrl);
    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  return (
    <div className="w-full bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-[#27272a] overflow-hidden animate-in fade-in duration-500 relative group">
      <div className="absolute inset-0  opacity-[0.02] pointer-events-none" />
      
      {/* DAW HEADER */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#27272a] bg-[#121214] /[0.01]">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-glow-cyan flex items-center justify-center">
               <Volume2 size={16} className="neon-cyan" />
            </div>
            <div className="text-right">
               <h4 className="data-text text-[#71717a]">MASTER_BUS // CH_01</h4>
               <div className="data-text text-[#fafafa]/80 neon-cyan">SIGNAL_STABLE_0XFF</div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-[#27272a] data-text text-[10px] text-[#a1a1aa]">
              {Math.floor(currentTime)}S / {Math.floor(duration)}S
            </div>
            <button 
              onClick={() => wavesurferRef.current?.playPause()}
              className="w-10 h-10 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-[#27272a] flex items-center justify-center active:scale-95 transition-all group/play"
            >
               {isPlaying ? <Square size={14} className="text-[#fafafa] fill-current" /> : <Play size={14} className="text-[#fafafa] fill-current group-active:scale-95 transition-colors" />}
            </button>
            <button className="w-10 h-10 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-[#27272a] flex items-center justify-center active:scale-95 transition-all">
               <Scissors size={14} className="text-[#a1a1aa]" />
            </button>
         </div>
      </div>

      {/* WAVEFORM AREA */}
      <div className="relative p-6 pt-10">
        <div ref={containerRef} className="w-full" />
        
        {/* TIME MARKERS */}
        <div className="absolute top-2 left-6 right-6 flex justify-between data-text text-[#71717a] text-[9px] font-medium relative z-10">
           <span>00:00:00</span>
           <span className="neon-cyan opacity-60">[{currentTime.toFixed(2)}s / {duration.toFixed(2)}s]</span>
           <span>MASTER_END</span>
        </div>

        {/* SCANNING LINE */}
        <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none" />
      </div>

      {/* FOOTER CONTROLS */}
      <div className="px-6 py-5 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl bg-[#121214] /[0.01] border-[#27272a] border-t flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 translate-y-0">
         <div className="flex-1 flex flex-wrap items-center gap-10">
            <div className="space-y-1.5 flex flex-col items-center md:items-start text-right">
               <div className="data-text text-[#71717a]">NOISE_GATE</div>
               <div className="h-1 w-24 bg-[#121214]  border-[#27272a] shadow-sm rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '50%' }}
                    className="h-full bg-cyan-500/40" 
                  />
               </div>
            </div>
            <div className="space-y-1.5 flex flex-col items-center md:items-start text-right">
               <div className="data-text text-[#71717a]">COMPRESSION</div>
               <div className="h-1 w-32 bg-[#121214]  border-[#27272a] shadow-sm rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['40%', '65%', '45%'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="h-full bg-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                  />
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <button 
              onClick={onMaster}
              className="px-6 py-2.5 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl bg-amber-500/5 text-amber-500 data-text text-[10px] active:scale-95 transition-all flex items-center gap-2 group border-glow-amber"
            >
               <Wand2 size={12} className="group-active:scale-95 transition-transform" />
               STUDIO_POLISH
            </button>
            <button className="p-2.5 bg-[#121214]  border border-[#27272a] shadow-medium rounded-xl border-[#27272a] text-[#71717a] active:scale-95 transition-all">
               <Headphones size={14} />
            </button>
         </div>
      </div>

      {/* REC WARNING */}
      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-8 border-2 border-red-500/40"
          >
             <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
                <h2 className="text-2xl font-arabic font-black text-[#ef4444]  ">يرجى استخدام سماعات الرأس</h2>
             </div>
             <p className="text-micro font-medium text-[#a1a1aa] text-center">لالتقاط صوت واضح ونقي</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
