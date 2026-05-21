import React, { useEffect, useState } from "react";
import { Archive as ArchiveIcon, FileText, Trash2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useTacticalSound } from "../hooks/useTacticalSound";

const RedactedText = ({ text }: { text: string }) => {
    return (
        <span className="bg-white/80 text-transparent hover:text-black hover:bg-transparent transition-all duration-[400ms] cursor-crosshair selection:bg-transparent inline-block">
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
        const res = await fetch("/api/dossiers");
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
      await fetch(`/api/dossiers/${id}`, { method: 'DELETE' });
      setArchive(prev => prev.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="text-gray-900 font-arabic h-full animate-in fade-in duration-500 relative" dir="rtl" onClick={playClick}>
      <div className="absolute inset-0 scanline opacity-[0.05] pointer-events-none z-50" />
      <div className="grain-overlay opacity-[0.02]" />

      {/* Header Section */}
      <header className="mb-12 relative z-10 bg-white shadow-sm p-10 border-gray-200 border-r-0 border-l-2 bracket-container">
        <div className="absolute inset-0  opacity-[0.02]" />
        <div className="flex items-center gap-4 mb-6">
           <div className="w-1.5 h-10 bg-red-600 shadow-[0_0_15px_#dc2626]" />
           <div className="flex flex-col gap-1">
               <div className="flex items-center gap-3">
                   <ShieldAlert size={14} className="neon-red" />
                   <span className="data-text neon-red text-[10px] tracking-[0.5em] font-bold">CLASSIFIED_VAULT_ACCESS // SECTOR_DEEP_RPA</span>
               </div>
               <h2 className="text-5xl font-black tracking-widest text-gray-900 leading-none uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                 أرشيف الكيانات <span className="font-mono text-red-600 opacity-80">[THE_VAULT]</span>
               </h2>
           </div>
        </div>
        <div className="flex justify-between items-end gap-10 relative z-10">
           <div className="max-w-2xl">
              <p className="data-text text-gray-500 text-[10px] uppercase leading-relaxed tracking-wider">
                Restricted access only. All telemetry logged for audit. Tactical dossiers extracted from spectral layers. Kernel monitoring active.
              </p>
           </div>
           <div className="text-right">
                <div className="data-text text-gray-500 text-[9px] mb-2 tracking-widest uppercase">SYSCAP_CLEARANCE</div>
                <div className="data-text neon-red text-sm font-black border border-red-500/30 px-4 py-1.5 bracket-corners bg-red-500/5">LVL_05 // ADM_ONLY</div>
           </div>
        </div>
      </header>

      {/* Grid Layout */}
      {archive.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
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
                  className="group p-10 bg-gray-50 bracket-corners border-gray-200 hover:border-red-500/40 hover:bg-red-500/[0.02] transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[350px] neon-glow-red"
                >
                  <div className="absolute inset-0  opacity-[0.02] pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-[0.01] group-hover:opacity-[0.04] pointer-events-none transition-opacity">
                      <span className="text-8xl font-black font-mono tracking-tighter text-red-600">CONFIDENTIAL</span>
                  </div>

                  <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="flex flex-col gap-3">
                          <span className="data-text bg-red-600 text-black px-3 py-1 text-[10px] self-start font-black tracking-widest uppercase shadow-[0_0_15px_#dc2626]">TOP_SECRET</span>
                          <span className="data-text text-gray-500 text-[9px] font-mono tracking-widest">DOSSIER_REF: 0x{doc.id ? doc.id.substring(0,8).toUpperCase() : 'NULL'}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          doc.id && handleDelete(doc.id);
                        }}
                        className="p-3 bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-600 transition-all bracket-corners group/del"
                      >
                        <Trash2 size={14} className="group-hover/del:scale-110" />
                      </button>
                  </div>
                  
                  <div className="flex-1 relative z-10 space-y-8">
                      <h3 className="text-2xl font-black font-arabic text-gray-900 mb-4 leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:text-red-400 transition-colors">
                          {words.map((w: string, idx: number) => {
                              if(isRedacted && w.length > 2 && idx % 2 !== 0) {
                                  return <span key={idx} className="mr-1"><RedactedText text={w} /></span>;
                              }
                              return <span key={idx} className="mr-1">{w}</span>;
                          })}
                      </h3>
                      
                      <div className="data-text text-gray-500 text-[11px] leading-relaxed max-h-[80px] overflow-hidden text-ellipsis line-clamp-3 font-medium">
                          {doc.scenes ? doc.scenes.map((s:any) => s.text).join(' ') : 'System telemetry extraction...'}
                      </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-200 flex justify-between items-center mt-10 relative z-10">
                      <div className="flex gap-10">
                          <div className="flex flex-col gap-1.5">
                            <span className="data-text text-gray-400 text-[9px] tracking-widest uppercase">FRAG_COUNT</span>
                            <span className="data-text text-gray-600 font-black">{doc.scenes ? doc.scenes.length : 0}</span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="data-text text-gray-400 text-[9px] tracking-widest uppercase">COM_STAMP</span>
                            <span className="data-text text-red-500/50 font-mono text-[10px]">{new Date(doc.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 bracket-corners group-hover:border-red-500/50 transition-all group-hover:rotate-12">
                        <FileText size={16} className="text-gray-500 group-hover:neon-red transition-colors" />
                      </div>
                  </div>
                </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center space-y-8 bg-white border border-gray-200 shadow-md rounded-xl border-red-500/20 relative z-10 w-full max-w-4xl mx-auto overflow-hidden animate-pulse">
           <div className="absolute inset-0  opacity-[0.03]" />
           <ShieldAlert size={48} className="text-red-600/40 relative z-10" />
           <div className="flex flex-col items-center gap-4 text-center">
             <span className="data-text neon-red text-lg tracking-[0.5em]">ACCESS_DENIED // DB_EMPTY</span>
             <p className="data-text text-gray-500 max-w-md">No classified dossiers found in the current security context. Initiate signal sweep to populate the vault.</p>
           </div>
        </div>
      )}
    </div>
  );
}
