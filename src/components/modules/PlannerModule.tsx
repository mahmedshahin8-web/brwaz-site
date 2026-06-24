import React, { useState } from "react";
import { EpisodeData } from "../../types";
import { Youtube, Instagram, Twitter, Calendar, Clock, CheckCircle2, Link as LinkIcon, Send } from "lucide-react";

export const PlannerModule: React.FC<{ data: EpisodeData }> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  
  return (
    <div className="bg-[#121214]  border border-[#27272a] p-10 space-y-8 relative overflow-hidden rounded-3xl shadow-sm min-h-[600px]">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-6 mb-8 text-right">
        <div className="flex gap-4">
            <button className="bg-[#4f46e5] text-[#121214] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-2 active:scale-95 transition-all">
                <Send size={14} /> Schedule Deployment
            </button>
        </div>
        <div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-[#f4eee0] font-arabic flex items-center gap-2 justify-end">
              خطة النشر الذكية <Calendar size={18} className="text-[#6366f1]"/> 
            </h3>
            <p className="text-xs text-[#a1a1aa] mt-2 font-arabic">ربط متزامن مع المنصات وجدولة آلية بناءً على ساعات الذروة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: External Integrations */}
        <div className="lg:col-span-4 space-y-6">
           <h4 className="text-[10px] uppercase font-mono text-[#71717a] tracking-widest font-bold mb-4">Integrations</h4>
           
           <div className="bg-[#27272a]/50 border border-[#27272a] p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-[#ff0000]/50 transition-colors">
              <div className="flex items-center gap-3">
                  <Youtube className="text-[#ff0000]" size={20} />
                  <div>
                      <p className="text-[#fafafa] font-bold text-xs font-mono">YouTube_Main</p>
                      <p className="text-[9px] text-green-500 font-mono uppercase">Connected</p>
                  </div>
              </div>
              <CheckCircle2 size={14} className="text-green-500" />
           </div>

           <div className="bg-[#27272a]/50 border border-[#27272a] p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-[#E1306C]/50 transition-colors">
              <div className="flex items-center gap-3">
                  <Instagram className="text-[#E1306C]" size={20} />
                  <div>
                      <p className="text-[#fafafa] font-bold text-xs font-mono">IG_Reels_Feed</p>
                      <p className="text-[9px] text-[#71717a] font-mono uppercase flex items-center gap-1"><LinkIcon size={8}/> Connect</p>
                  </div>
              </div>
           </div>

           <div className="bg-[#27272a]/50 border border-[#27272a] p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-[#1DA1F2]/50 transition-colors">
              <div className="flex items-center gap-3">
                  <Twitter className="text-[#1DA1F2]" size={20} />
                  <div>
                      <p className="text-[#fafafa] font-bold text-xs font-mono">X_Timeline</p>
                      <p className="text-[9px] text-[#71717a] font-mono uppercase flex items-center gap-1"><LinkIcon size={8}/> Connect</p>
                  </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Calendar Schedule */}
        <div className="lg:col-span-8 space-y-6 relative">
            <h4 className="text-[10px] uppercase font-mono text-[#6366f1] tracking-widest font-bold mb-4 text-right">Deployment Graph</h4>
            
            <div className="flex gap-2 justify-end mb-6">
                {["Today", "Tomorrow", "Weekend"].map(day => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${selectedDate === day ? "bg-[#6366f1] text-[#121214]" : "bg-[#27272a] text-[#71717a] hover:text-[#4f46e5]"}`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {/* Master Video */}
                <div className="bg-[#121214] border border-[#ff0000]/30 border-r-4 border-r-[#ff0000] p-6 rounded-xl flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0000]/5 blur-3xl rounded-full" />
                    <div className="flex items-center gap-4 relative z-10">
                        <button className="text-[10px] bg-[#27272a] hover:bg-[#ff0000]/20 text-[#71717a] hover:text-[#ff0000] px-3 py-2 rounded-lg font-mono font-bold tracking-widest transition-colors uppercase">
                            Edit Slot
                        </button>
                    </div>
                    <div className="text-right relative z-10">
                        <h5 className="font-bold text-[#fafafa] font-arabic text-lg mb-1">{data.video_title}</h5>
                        <p className="text-[10px] text-[#71717a] font-mono uppercase flex items-center gap-2 justify-end">
                             Master Release - YouTube <Clock size={10} className="text-[#4f46e5]" /> 18:00 UTC
                        </p>
                    </div>
                </div>

                {/* Shorts 1 */}
                <div className="bg-[#121214] border border-[#E1306C]/30 border-r-4 border-r-[#E1306C] p-6 rounded-xl flex justify-between items-center group relative overflow-hidden opacity-80">
                    <div className="flex items-center gap-4 relative z-10">
                        <button className="text-[10px] bg-[#27272a] hover:bg-[#E1306C]/20 text-[#71717a] hover:text-[#E1306C] px-3 py-2 rounded-lg font-mono font-bold tracking-widest transition-colors uppercase">
                            Edit Slot
                        </button>
                    </div>
                    <div className="text-right relative z-10">
                        <h5 className="font-bold text-[#fafafa] font-arabic text-sm mb-1 line-clamp-1">{data.publishing_kit.youtube_titles[1] || "Short 1"}</h5>
                        <p className="text-[10px] text-[#71717a] font-mono uppercase flex items-center gap-2 justify-end">
                             Fragment 1 - IG Reels + YT Shorts <Clock size={10} className="text-[#4f46e5]" /> {selectedDate === "Today" ? "21:00 UTC" : "12:00 UTC"}
                        </p>
                    </div>
                </div>

                {/* Shorts 2 */}
                <div className="bg-[#121214] border border-[#1DA1F2]/30 border-r-4 border-r-[#1DA1F2] p-6 rounded-xl flex justify-between items-center group relative overflow-hidden opacity-60">
                    <div className="flex items-center gap-4 relative z-10">
                        <button className="text-[10px] bg-[#27272a] hover:bg-[#1DA1F2]/20 text-[#71717a] hover:text-[#1DA1F2] px-3 py-2 rounded-lg font-mono font-bold tracking-widest transition-colors uppercase">
                            Edit Slot
                        </button>
                    </div>
                    <div className="text-right relative z-10">
                        <h5 className="font-bold text-[#fafafa] font-arabic text-sm mb-1 line-clamp-1">{data.publishing_kit.youtube_titles[2] || "Short 2"}</h5>
                        <p className="text-[10px] text-[#71717a] font-mono uppercase flex items-center gap-2 justify-end">
                             Fragment 2 - X (Twitter) Video <Clock size={10} className="text-[#4f46e5]" /> {selectedDate === "Today" ? "TBD" : "16:00 UTC"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
