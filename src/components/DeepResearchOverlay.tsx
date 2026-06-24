import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, CheckCircle2, ChevronRight, Binary, Globe, FileText, Search, Fingerprint, Database, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const DeepResearchOverlay = ({ 
  topic, 
  interactionId, 
  onClose,
  onComplete 
}: { 
  topic: string, 
  interactionId?: string, 
  onClose: () => void,
  onComplete: (report: string) => void
}) => {
  const [status, setStatus] = useState<string>("running");
  const [steps, setSteps] = useState<{type: string, title: string, detail: string}[]>([]);
  const [report, setReport] = useState<string>("");

  useEffect(() => {
    let active = true;

    const runResearch = async () => {
      let currentReport = "";
      try {
        const engine = localStorage.getItem("useOllama") === "true" ? "ollama" : "gemini";
        const ollamaUrl = localStorage.getItem("ollamaUrl") || "";
        const ollamaModel = localStorage.getItem("ollamaModel") || "gemma4:31b-cloud";

        const res = await fetch("/api/research/free-deep-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, engine, ollamaUrl, ollamaModel })
        });

        if (!res.ok) throw new Error("فشل الاتصال بالخادم");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        if (reader) {
          while (active) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
              const message = buffer.substring(0, boundary);
              buffer = buffer.substring(boundary + 2);
              boundary = buffer.indexOf('\n\n');
              
              if (message.startsWith('data: ')) {
                try {
                  const data = JSON.parse(message.substring(6));
                  
                  if (data.type === "thought" || data.type === "search") {
                     setSteps(prev => [...prev, { type: data.type, title: data.title, detail: data.detail }]);
                  } else if (data.type === "output") {
                     currentReport = data.report;
                     setSteps(prev => [...prev, { type: "output", title: "كتابة المسودة / التقرير", detail: data.report }]);
                     setReport(data.report);
                  } else if (data.type === "completed") {
                     setStatus("completed");
                     onComplete(data.report || currentReport);
                  } else if (data.type === "error") {
                     setStatus("failed");
                     setSteps(prev => [...prev, { type: "error", title: "خطأ", detail: data.error }]);
                  }
                } catch (e) {
                   console.error("Error parsing JSON chunk:", e, "Message:", message);
                }
              }
            }
          }
        }
      } catch (err: any) {
        if (active) {
           setStatus("failed");
           setSteps(prev => [...prev, { type: "error", title: "تعذر الاستقصاء", detail: err.message }]);
        }
      }
    };

    runResearch();

    return () => { active = false; };
  }, [topic]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" dir="rtl">
      <div className="absolute inset-0 bg-[#070709]/90 backdrop-blur-md" onClick={status === "completed" || status === "failed" ? onClose : undefined} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[#121214] border border-[#27272a] shadow-2xl flex flex-col max-h-[90vh] rounded-3xl overflow-hidden"
      >
        <div className="p-6 border-b border-[#27272a] flex justify-between items-center bg-[#18181b]/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#4f46e5]/10 rounded-xl border border-[#4f46e5]/30 flex flex-col justify-center items-center text-[#4f46e5] relative overflow-hidden">
                <Search className="w-6 h-6 z-10" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(79,70,229,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4f46e5]/50 to-transparent animate-scan z-10" />
             </div>
             <div>
                <h3 className="text-xl font-arabic font-black text-[#fafafa] flex items-center gap-2">
                   المحقق الآلي: بحث عميق
                   {status === "running" && <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" />}
                </h3>
                <p className="text-sm text-[#a1a1aa] font-arabic mt-1">يتم الآن البحث عن: <span className="text-[#e4e4e7] font-bold">{topic}</span></p>
             </div>
          </div>
          {(status === "completed" || status === "failed") && (
            <button onClick={onClose} className="p-2 bg-[#27272a]/50 hover:bg-[#27272a] rounded-lg transition-colors">
              <X className="w-5 h-5 text-[#a1a1aa]" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
           {steps.map((step, idx) => {
             let icon = <Fingerprint className="w-4 h-4 text-[#71717a]" />;
             
             if (step.type === "search") {
                icon = <Globe className="w-4 h-4 text-cyan-400" />;
             } else if (step.type === "output") {
                icon = <FileText className="w-4 h-4 text-green-400" />;
             } else if (step.type === "thought") {
                icon = <Database className="w-4 h-4 text-purple-400" />;
             } else if (step.type === "error") {
                icon = <X className="w-4 h-4 text-red-500" />;
             }

             return (
               <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0 group-hover:border-[#4f46e5]/50 transition-colors">
                       {icon}
                    </div>
                    {idx !== steps.length - 1 && <div className="w-px h-full bg-[#27272a] mt-2 group-hover:bg-[#4f46e5]/30 transition-colors" />}
                  </div>
                  <div className="pb-6 flex-1">
                     <p className="text-sm font-arabic font-bold text-[#e4e4e7]">{step.title}</p>
                     {step.detail && (
                       <div className="mt-2 p-4 bg-[#18181b]/50 border border-[#27272a] rounded-xl text-sm font-arabic text-[#a1a1aa] whitespace-pre-wrap leading-relaxed shadow-sm">
                          {step.detail}
                       </div>
                     )}
                  </div>
               </div>
             );
           })}
           {status === "completed" && (
             <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl mt-8">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="font-arabic font-bold text-green-400 text-sm">تم الانتهاء من البحث العميق وتجميع التقرير.</p>
             </div>
           )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

