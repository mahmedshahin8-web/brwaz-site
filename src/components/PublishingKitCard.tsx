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
    <div className="space-y-8 bg-white shadow-sm border border-gray-200 p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Youtube className="w-24 h-24" />
      </div>

      <header className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <h3 className="text-micro font-mono text-gray-600 uppercase tracking-[0.4em]">YouTube_Packaging_Module</h3>
        </div>
        <span className="text-[10px] font-mono text-gray-500">VER: 2.1_TACTICAL</span>
      </header>

      {/* Suggested Titles */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono text-blue-600 uppercase tracking-widest flex items-center gap-2">
           <Copy className="w-3 h-3" /> Potential_Viral_Titles
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {data.youtube_titles.map((title, i) => (
            <button 
              key={i}
              onClick={() => copyToClipboard(title, "العنوان")}
              className="group flex items-center justify-between p-4 bg-white border-gray-100 shadow-sm border border-gray-200 active:scale-95 transition-all text-right"
            >
              <Copy className="w-4 h-4 text-gray-400 group-active:scale-95 transition-colors" />
              <span className="font-arabic text-lg text-gray-900/80 group-active:scale-95">{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> High_Retention_Description
            </h4>
            <button onClick={() => copyToClipboard(data.description, "الوصف")} className="text-[10px] font-mono text-gray-500 active:scale-95 uppercase flex items-center gap-2">
                <Copy size={12} /> Copy_Full_TEXT
            </button>
        </div>
        <div className="p-6 bg-white border-gray-100 shadow-sm border border-gray-200 font-arabic text-sm text-gray-600 leading-relaxed whitespace-pre-wrap text-right h-60 overflow-y-auto custom-scrollbar">
          {data.description}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono text-blue-600 uppercase tracking-widest flex items-center gap-2">
           <Hash className="w-3 h-3" /> SEO_Hash_Cluster
        </h4>
        <div className="flex flex-wrap flex-row-reverse gap-2">
          {data.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-white border-gray-100 shadow-sm border border-gray-200 text-[10px] font-mono text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Thumbnail Prompt Re-verification */}
      <div className="p-6 bg-blue-600/5 border-l-2 border-blue-500 space-y-3">
         <div className="flex items-center gap-2 text-blue-600">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Verified_Thumbnail_Strategy</span>
         </div>
         <p className="font-arabic text-sm text-gray-900/70 text-right">
            {data.thumbnail_prompt}
         </p>
      </div>
    </div>
  );
}
