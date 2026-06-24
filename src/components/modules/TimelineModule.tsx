import React from "react";
import { EpisodeData } from "../../types";
import { Play, Mic, Video, Volume2 } from "lucide-react";

export const TimelineModule: React.FC<{ data: EpisodeData }> = ({ data }) => {
  return (
    <div className="bg-[#121214]  border border-[#27272a] p-6 lg:p-10 space-y-8 relative overflow-hidden rounded-3xl shadow-sm min-h-[600px]" dir="ltr">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-6 mb-8">
        <span className="text-[10px] font-mono text-[#4f46e5] uppercase tracking-widest font-black flex items-center gap-2">
          <Play size={14} className="fill-current text-[#6366f1]"/> Production Timeline
        </span>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[#fafafa] font-arabic font-bold text-sm">التسلسل الزمني والمونتاج</p>
                <p className="text-[9px] font-mono text-[#71717a] uppercase opacity-70">Estimated: {Math.ceil(data.scenes.length * 5)}s</p>
            </div>
        </div>
      </div>

      <div className="relative overflow-x-auto overflow-y-hidden pb-10 custom-scrollbar">
        {/* Timeline Tracks Container */}
        <div className="min-w-[1200px] space-y-6">
          
          {/* Track 1: Video / Visuals */}
          <div className="flex relative">
            <div className="w-48 shrink-0 border-r border-[#27272a] pr-4 flex items-center justify-end sticky left-0 bg-[#121214]/90 z-10 ">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-widest font-bold flex items-center gap-2">
                 Visual B-Roll <Video size={12} className="text-[#2b5797]" />
              </span>
            </div>
            <div className="flex-1 flex gap-2 pl-4">
              {data.scenes.map((scene, i) => (
                <div key={`vid-${i}`} className="h-24 shrink-0 bg-[#09090b]/80 border border-[#27272a] rounded-xl p-3 relative group overflow-hidden" style={{ width: Math.max(200, (scene.voice_over?.split(" ").length || 10) * 8) + 'px' }}>
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#2b5797]/50" />
                  <p className="text-[10px] text-[#a1a1aa] font-mono line-clamp-3 leading-relaxed mt-1" dir="rtl">{scene.image_prompt || scene.b_roll_search_query || 'Visual Reference'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Track 2: Voiceover / Script */}
          <div className="flex relative">
            <div className="w-48 shrink-0 border-r border-[#27272a] pr-4 flex items-center justify-end sticky left-0 bg-[#121214]/90 z-10 ">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-widest font-bold flex items-center gap-2">
                 Voice Script <Mic size={12} className="text-[#4f46e5]" />
              </span>
            </div>
            <div className="flex-1 flex gap-2 pl-4">
              {data.scenes.map((scene, i) => (
                <div key={`vo-${i}`} className="h-auto min-h-[80px] shrink-0 bg-[#6366f1]/5 border border-[#6366f1]/30 rounded-xl p-3 relative group" style={{ width: Math.max(200, (scene.voice_over?.split(" ").length || 10) * 8) + 'px' }}>
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#4f46e5]" />
                  <p className="text-[11px] text-[#fafafa] font-arabic leading-relaxed line-clamp-4 text-right mt-1" dir="rtl">{scene.voice_over}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Track 3: SFX / Music */}
          <div className="flex relative">
            <div className="w-48 shrink-0 border-r border-[#27272a] pr-4 flex items-center justify-end sticky left-0 bg-[#121214]/90 z-10 ">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-widest font-bold flex items-center gap-2">
                 Audio/SFX <Volume2 size={12} className="text-emerald-500" />
              </span>
            </div>
            <div className="flex-1 flex gap-2 pl-4">
              {data.scenes.map((scene, i) => (
                <div key={`sfx-${i}`} className="h-14 shrink-0 bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-3 relative group overflow-hidden" style={{ width: Math.max(200, (scene.voice_over?.split(" ").length || 10) * 8) + 'px' }}>
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/30" />
                  <p className="text-[10px] text-[#a1a1aa] font-mono truncate mt-1 text-right" dir="rtl">{scene.sound_design || scene.sfx_prompt || 'Ambient Noise'}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Time ruler */}
        <div className="mt-12 border-t border-[#27272a] pt-2 relative opacity-40 pl-[208px]">
           <div className="flex gap-2">
             {Array.from({length: 40}).map((_, i) => (
               <div key={`ruler-${i}`} className="border-l border-[#71717a] h-2 w-[100px] relative">
                 <span className="absolute -top-4 -left-2 text-[8px] font-mono text-[#71717a]">0:{i*5}</span>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
