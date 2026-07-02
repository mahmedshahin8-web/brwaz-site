import React from "react";
import { PublishingKit } from "../types";
import { Youtube, Copy, CheckCircle2, Hash, BookOpen } from "lucide-react";
import { notify } from "../lib/notify";

interface PublishingKitCardProps {
  data: PublishingKit;
}

export function PublishingKitCard({ data }: PublishingKitCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notify.classified(`${label} تم النسخ`);
  };

  return (
    <div className="space-y-8 bg-[#121214]  shadow-sm border border-[#27272a] p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Youtube className="w-24 h-24" />
      </div>

      <header className="flex justify-between items-center border-b border-[#27272a] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <h3 className="text-micro font-mono text-[#a1a1aa] uppercase tracking-[0.4em]">YouTube_Packaging_Module</h3>
        </div>
        <span className="text-[10px] font-mono text-[#71717a]">VER: 2.1_TACTICAL</span>
      </header>

      {/* Suggested Titles */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono text-[#4f46e5] uppercase tracking-widest flex items-center gap-2">
           <Copy className="w-3 h-3" /> Potential_Viral_Titles
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {Array.isArray(data.youtube_titles) ? data.youtube_titles.map((title, i) => {
            const angleLabels = [
              { label: "فضولي (Curiosity)", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "قصصي (Story-Driven)", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "صادم (Shocking)", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
            ];
            const angle = angleLabels[i] || { label: "بديل (Alternative)", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
            
            return (
              <button 
                key={i}
                onClick={() => copyToClipboard(title, "العنوان")}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#121214] shadow-sm border border-[#27272a] hover:border-[#3f3f46] active:scale-95 transition-all text-right gap-4"
              >
                <div className="flex flex-col items-start gap-2 w-full">
                   <div className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm border ${angle.bg} ${angle.color} ${angle.border}`}>
                     {angle.label}
                   </div>
                   <span className="font-arabic text-lg text-[#fafafa] font-bold group-hover:text-[#4f46e5] transition-colors">{typeof title === 'string' ? title.replace(/^[*-]\s*/, '').replace(/^"|"$/g, '') : String(title)}</span>
                </div>
                <Copy className="w-5 h-5 text-[#71717a] group-hover:text-white shrink-0 mt-2 md:mt-0" />
              </button>
            )
          }) : null}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono text-[#4f46e5] uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> High_Retention_Description
            </h4>
            <button onClick={() => copyToClipboard(data.description, "الوصف")} className="text-[10px] font-mono text-[#71717a] active:scale-95 uppercase flex items-center gap-2">
                <Copy size={12} /> Copy_Full_TEXT
            </button>
        </div>
        <div className="p-6 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] font-arabic text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-wrap text-right h-60 overflow-y-auto custom-scrollbar">
          {data.description}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono text-[#4f46e5] uppercase tracking-widest flex items-center gap-2">
           <Hash className="w-3 h-3" /> SEO_Hash_Cluster
        </h4>
        <div className="flex flex-wrap flex-row-reverse gap-2">
          {Array.isArray(data.tags) ? data.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] text-[10px] font-mono text-[#a1a1aa]">
              #{tag}
            </span>
          )) : null}
        </div>
      </div>

      {/* Thumbnail Prompt Re-verification */}
      <div className="p-6 bg-[#4f46e5]/5 border-l-2 border-[#4f46e5] space-y-3">
         <div className="flex items-center gap-2 text-[#4f46e5]">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Verified_Thumbnail_Strategy</span>
         </div>
         <p className="font-arabic text-sm text-[#fafafa]/70 text-right">
            {data.thumbnail_prompt}
         </p>
      </div>
    </div>
  );
}
