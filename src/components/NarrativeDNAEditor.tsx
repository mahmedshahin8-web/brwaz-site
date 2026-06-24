import React from 'react';
import { motion } from 'motion/react';
import { Target, ShieldAlert, BookOpen } from 'lucide-react';

interface NarrativeDNAEditorProps {
  strategy: "HCS" | "HAP";
  onChange: (strategy: "HCS" | "HAP") => void;
}

export function NarrativeDNAEditor({ strategy, onChange }: NarrativeDNAEditorProps) {
  return (
    <div className="flex flex-col gap-4 bg-[#121214]  shadow-sm border border-[#27272a] p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <BookOpen className="w-4 h-4 text-muted-amber" />
           <span className="text-[11px] font-mono text-[#fafafa]/70 uppercase tracking-widest font-bold">
             هيكل قصة الفيديو (Narrative Strategy)
           </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => onChange("HCS")}
          className={`px-4 py-4 rounded-md text-[11px] font-mono font-bold transition-all flex flex-col items-center gap-1 ${
            strategy === "HCS" 
              ? 'bg-muted-amber/20 text-muted-amber border border-muted-amber shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
              : 'bg-[#121214]  border-[#27272a] shadow-sm text-[#a1a1aa] border border-[#27272a] active:scale-95'
          }`}
        >
          <Target className="w-4 h-4" />
          شرح وتحليل (HCS)
        </button>
        <button 
          onClick={() => onChange("HAP")}
          className={`px-4 py-4 rounded-md text-[11px] font-mono font-bold transition-all flex flex-col items-center gap-1 ${
            strategy === "HAP" 
              ? 'bg-muted-amber/20 text-muted-amber border border-muted-amber shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
              : 'bg-[#121214]  border-[#27272a] shadow-sm text-[#a1a1aa] border border-[#27272a] active:scale-95'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          إثارة وتشويق (HAP)
        </button>
      </div>

      <div className="p-4 bg-[#121214] /30 border border-[#27272a] rounded-lg text-micro text-[#a1a1aa] font-arabic text-center leading-relaxed">
        {strategy === "HCS" 
          ? "الاستراتيجية: مقدمة جذابة ← شرح المشكلة أو السياق ← تقديم الحلول والخلاصة. مثالي للفيديوهات التعليمية والثقافية." 
          : "الاستراتيجية: مشهد صادم ← إثبات المصداقية ← كشف اللغز في النهاية. مثالي لقصص الجرائم، الغموض، والأحداث الغريبة."}
      </div>
    </div>
  );
}
