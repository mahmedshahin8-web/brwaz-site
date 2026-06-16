import { apiFetch } from "../lib/apiFetch";
import React, { useEffect, useState } from "react";
import { Archive as ArchiveIcon, FileText, Trash2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useTacticalSound } from "../hooks/useTacticalSound";

const RedactedText = ({ text }: { text: string }) => {
    return (
        <span className="bg-[#121214] /80 text-transparent active:scale-95 transition-all duration-[400ms] cursor-crosshair selection:bg-transparent inline-block">
            {text}
        </span>
    );
};

export default function ArchivePage() {
  const [archive, setArchive] = useState<any[]>([]);
  const { playClick, playHover } = useTacticalSound();

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await apiFetch("/api/dossiers");
        if (res.ok) {
          const docs = await res.json();
          setArchive(docs);
        }
      } catch (err) {
        // silently ignore
      }
    };
    fetchDossiers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/dossiers/${id}`, { method: 'DELETE' });
      setArchive(prev => prev.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="text-[#fafafa] font-arabic h-full animate-in fade-in duration-500 relative" dir="rtl" onClick={playClick}>
      <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none z-50" />
      <div className="grain-overlay opacity-[0.02]" />

      {/* Header Section */}
      <header className="mb-8 relative z-10 bg-[#121214]  shadow-sm p-8 border border-[#27272a] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        <div className="flex items-center gap-4 relative z-10">
           <div className="w-1.5 h-12 bg-gradient-to-b from-[#4f46e5] to-[#4f46e5] rounded-full" />
           <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                   <ArchiveIcon size={14} className="text-[#4f46e5]" />
                   <span className="text-[#a1a1aa] font-arabic text-[10px]   font-bold">الأرشيف</span>
               </div>
               <h2 className="text-4xl font-black text-[#fafafa] font-arabic leading-none tracking-tight">
                 الأرشيف والمسودات
               </h2>
           </div>
        </div>
        <div className="flex flex-col md:items-end gap-2 relative z-10">
             <div className="text-[#71717a] font-arabic text-[10px]  ">حالة التخزين</div>
             <div className="text-[#4f46e5] text-sm font-bold font-arabic border border-[#4f46e5]/30 px-4 py-1.5 rounded-lg bg-[#27272a]/50 backdrop-blur">
               عادي
             </div>
        </div>
      </header>

      {/* Grid Layout */}
      {archive.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {archive.map((doc, i) => {
            const isRedacted = Math.random() > 0.4;
            const words = (doc.video_title || "Dossier_Unnamed").split(' ');

            return (
                <motion.div 
                  key={doc.id || i}
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={playHover}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="group p-8 bg-[#121214]  rounded-xl border border-[#27272a] active:scale-95 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[300px] shadow-sm hover:border-[#4f46e5]/50 hover:shadow-sm"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#27272a] group-hover:bg-[#4f46e5] transition-colors duration-300" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex flex-col gap-2">
                          <span className="text-[#09090b] bg-[#4f46e5] px-3 py-1 text-[9px] rounded-lg font-arabic font-bold  ">مسودة محفوظة</span>
                          <span className="text-[#a1a1aa] text-[9px] font-arabic ">REF: {doc.id ? doc.id.substring(0,8).toUpperCase() : 'NULL'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          doc.id && handleDelete(doc.id);
                        }}
                        className="p-2.5 bg-[#27272a] rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-[#ef4444] hover:border-[#ef4444]/30 hover:bg-[#ef4444]/10 active:scale-95 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                  
                  <div className="flex-1 relative z-10 space-y-4">
                      <h3 className="text-xl font-bold font-arabic text-[#fafafa] mb-2 leading-tight group-hover:text-[#4f46e5] transition-colors">
                          {words.map((w: string, idx: number) => {
                              if(isRedacted && w.length > 2 && idx % 2 !== 0) {
                                  return <span key={idx} className="mr-1"><RedactedText text={w} /></span>;
                              }
                              return <span key={idx} className="mr-1">{w}</span>;
                          })}
                      </h3>
                      
                      <div className="text-[#a1a1aa] font-arabic text-[12px] leading-relaxed max-h-[60px] overflow-hidden text-ellipsis line-clamp-2">
                          {doc.scenes ? doc.scenes.map((s:any) => s.text).join(' ') : 'جاري استخراج البيانات من السجل الذاكري...'}
                      </div>
                  </div>
                  
                  <div className="pt-6 border-t border-[#27272a] flex justify-between items-center mt-6 relative z-10">
                      <div className="flex gap-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#71717a] font-arabic text-[9px]  ">عدد المشاهد</span>
                            <span className="text-[#fafafa] font-arabic font-bold">{doc.scenes ? doc.scenes.length : 0}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[#71717a] font-arabic text-[9px]  ">التاريخ</span>
                            <span className="text-[#a1a1aa] font-arabic text-[10px]">{new التاريخ(doc.createdAt).toLocaleالتاريخString('en-GB')}</span>
                          </div>
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#27272a] border border-[#27272a] text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-[#09090b] transition-colors">
                        <FileText size={14} />
                      </div>
                  </div>
                </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center space-y-6 bg-[#121214]  border border-[#27272a] shadow-sm rounded-xl relative z-10 w-full mx-auto overflow-hidden group hover:border-[#4f46e5]/30 transition-colors">
           <ArchiveIcon size={48} className="text-[#27272a] group-hover:text-[#4f46e5]/40 transition-colors relative z-10" />
           <div className="flex flex-col items-center gap-3 text-center">
             <span className="text-[#a1a1aa] font-arabic text-lg  ">الأرشيف فارغ</span>
             <p className="text-[#71717a] font-arabic max-w-md text-sm">لا توجد مسودات محفوظة حالياً. سيتم حفظ السكريبتات تلقائياً هنا عند الإنشاء.</p>
           </div>
        </div>
      )}
    </div>
  );
}
