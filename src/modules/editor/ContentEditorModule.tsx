import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EditorContent } from "@tiptap/react";
import { MasterOutline, EpisodeData } from "../../types";
import { Copy, Volume2, Square, Eye, Archive, Maximize2, Minimize2, Database, Layers, CheckCircle2 } from "lucide-react";
import { ScriptEvaluator } from "../../components/ScriptEvaluator";
import { copyToClipboard } from "../../lib/exportUtils";

interface ContentEditorModuleProps {
  data: EpisodeData;
  researchMap: MasterOutline | null;
  finalVoiceScript: string;
  setFinalVoiceScript: (script: string) => void;
  handleUpdateGraph: (script: string) => void;
  editor: any;
  handlePlayVoice: () => void;
  isPlayingVoice: boolean;
  setShowTeleprompter: (show: boolean) => void;
  useOllama: boolean;
  renderSceneCards: React.ReactNode;
}

export const ContentEditorModule: React.FC<ContentEditorModuleProps> = ({
  data,
  researchMap,
  finalVoiceScript,
  setFinalVoiceScript,
  handleUpdateGraph,
  editor,
  handlePlayVoice,
  isPlayingVoice,
  setShowTeleprompter,
  useOllama,
  renderSceneCards
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <motion.div 
      key="ts-script"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-12"
    >
      {!isFocusMode && (
        <ScriptEvaluator 
          script={finalVoiceScript} 
          engine={useOllama ? "ollama" : "gemini"} 
          onRefined={(newScript) => {
            setFinalVoiceScript(newScript);
            handleUpdateGraph(newScript);
          }}
        />
      )}
      
      <motion.div 
        layout
        className={`${isFocusMode ? 'fixed inset-0 z-[100] bg-[#0a0e14] p-8 md:p-16 overflow-y-auto' : 'bg-[#111722]/60 backdrop-blur-md border border-[#17202c] p-10 relative overflow-hidden rounded-3xl shadow-subtle'} space-y-8`}
      >
        <div className={`flex justify-between items-center ${isFocusMode ? 'border-b border-[#17202c] pb-4 mb-12' : 'bg-[#17202c]/50 p-4 -mt-10 -mx-10 border-b border-[#17202c] mb-8 rounded-t-3xl'}`}>
          <span className="text-[10px] font-medium text-[#d4a574] font-black flex items-center gap-2">
            غرفة العمليات {isFocusMode ? '(Focus Mode)' : '(Desktop)'}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors ${isFocusMode ? 'text-[#c89b5a] bg-[#17202c]/50' : 'text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574]'} text-[10px] font-bold font-medium`} title="وضع التركيز">
              {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
              {isFocusMode ? 'خروج' : 'تركيز'}
            </button>
            <button onClick={() => setShowTeleprompter(true)} className="px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574] text-[10px] font-bold font-medium" title="الوضع التلقيني">
              <Eye size={14} /> Teleprompter
            </button>
            <button onClick={handlePlayVoice} className="w-10 h-10 border border-[#17202c] rounded-xl flex items-center justify-center active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574]">
              {isPlayingVoice ? <Square size={14} className="fill-current" /> : <Volume2 size={16} />}
            </button>
            <button onClick={() => copyToClipboard(finalVoiceScript, "نسخ السكريبت للمونتير")} className="px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#2b5797] text-[10px] font-bold font-medium" title="نسخ السكريبت كامل للمونتير">
              <Copy size={14} /> نسخ السكريبت
            </button>
          </div>
        </div>

        <div className={`flex flex-row-reverse gap-8 ${isFocusMode ? '' : 'border-t border-[#17202c] pt-8 mt-4'}`}>
          {/* MIDDLE: EDITOR */}
          <div className={`relative text-right ${isFocusMode ? 'max-w-4xl mx-auto w-full' : 'flex-1 min-w-[500px]'}`} dir="rtl">
            <div className={`tiptap-editor-wrapper text-right ${isFocusMode ? 'focus-mode-active' : ''}`}>
              <EditorContent editor={editor} className={`w-full min-h-[600px] bg-transparent font-arabic leading-[2.5] text-[#f5f3f0] p-0 outline-none focus:text-[#f5f3f0] transition-colors custom-scrollbar border-0 ${isFocusMode ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-3xl'}`} dir="rtl" />
            </div>
          </div>
          
          {/* RIGHT (Arabic Left): DOSSIER & ARCHIVE PANEL */}
          <AnimatePresence>
            {!isFocusMode && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
                exit={{ opacity: 0, width: 0 }}
                className="shrink-0 border-l border-[#17202c] pl-6 overflow-hidden relative" dir="rtl"
              >
            <div className="sticky top-0 space-y-6">
                <h4 className="text-[11px] font-medium text-[#f5f3f0] border-b border-[#17202c] pb-3 text-right font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2"><Archive size={14} className="text-[#c89b5a]"/> أرشيف عقل الباحث</span>
                  <span className="bg-[#17202c] text-[#d4a574] px-2 py-0.5 rounded text-[9px]">مباشر</span>
                </h4>
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  <div className="bg-[#111722]/60 backdrop-blur-md p-5 border border-[#17202c] rounded-xl hover:shadow-deep hover:border-[#a0764d]/30 transition-all cursor-pointer relative group flex flex-col gap-2">
                      <div className="absolute top-0 right-0 w-1 h-full bg-[#a0764d] rounded-r-xl"></div>
                      <h5 className="font-bold text-[#f5f3f0] text-sm">الرواية الرسمية</h5>
                      <p className="text-xs text-[#6d6964] leading-relaxed font-arabic line-clamp-4 group-hover:line-clamp-none transition-all">
                          {researchMap?.core_conflict_or_mystery || "جاري جلب الروايات من الأرشيف..."}
                      </p>
                      <span className="text-[9px] font-medium text-[#c89b5a] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">استخراج أدلة</span>
                  </div>
                  <div className="bg-[#111722]/60 backdrop-blur-md p-5 border border-[#17202c] rounded-xl hover:shadow-deep hover:border-red-200 transition-all cursor-pointer relative group flex flex-col gap-2">
                      <div className="absolute top-0 right-0 w-1 h-full bg-red-500 rounded-r-xl"></div>
                      <h5 className="font-bold text-[#f5f3f0] text-sm">هجوم الأعداء / النقيض</h5>
                      <p className="text-xs text-[#6d6964] leading-relaxed font-arabic line-clamp-4 group-hover:line-clamp-none transition-all">
                          {researchMap?.hidden_patterns_or_contradictions?.[0] || researchMap?.editorial_angle || "لا توجد أدلة مضادة متوفرة حالياً."}
                      </p>
                      <span className="text-[9px] font-medium text-[#a0333c] font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">توظيف كحبكة مضادة</span>
                  </div>
                  <div className="bg-[#111722]/60 backdrop-blur-md p-5 border border-[#17202c] rounded-xl hover:shadow-deep hover:border-amber-200 transition-all cursor-pointer relative group flex flex-col gap-2">
                      <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 rounded-r-xl"></div>
                      <h5 className="font-bold text-[#f5f3f0] text-sm">كواليس المقربين</h5>
                      <p className="text-xs text-[#6d6964] leading-relaxed font-arabic line-clamp-4 group-hover:line-clamp-none transition-all">
                          {researchMap?.timeline?.[0]?.event_description || "أسرار ما وراء الكواليس قيد التحقق..."}
                      </p>
                  </div>
                </div>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
          
          {/* LEFT (Arabic Right): SOURCE MARGIN */}
          <AnimatePresence>
            {!isFocusMode && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 224 }}
                exit={{ opacity: 0, width: 0 }}
                className="shrink-0 border-r border-[#17202c] pr-6 overflow-hidden relative" dir="ltr"
              >
                <div className="sticky top-0 space-y-6">
                    <h4 className="text-[10px] font-medium text-[#6d6964] border-b border-[#17202c] pb-3 text-left font-bold flex items-center gap-2">
                      <Database size={12}/> Verified Sources
                    </h4>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                      {data.sources.map((src, i) => {
                          const s = typeof src === 'string' ? { title: src, url: '#' } : src;
                          return (
                            <div key={i} className="space-y-1 group text-left">
                                <span className="text-[8px] font-medium text-[#6d6964] block font-bold">[SOURCE {i+1}]</span>
                                <a 
                                  href={s.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] font-arabic text-[#a8a09f] group-active:scale-95 transition-colors leading-relaxed block font-semibold"
                                >
                                  {s.title}
                                </a>
                            </div>
                          )
                      })}
                      {data.sources.length === 0 && (
                        <span className="text-[9px] font-arabic text-[#6d6964] italic">No citations found.</span>
                      )}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={`flex gap-10 overflow-hidden ${isFocusMode ? 'fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-4 bg-[#0a0e14] border-t border-[#17202c] z-[110]' : 'pt-8 border-t border-[#17202c]'}`}>
          <div className="space-y-1">
            <span className="text-[8px] font-medium text-[#6d6964] block font-bold">عدد الكلمات</span>
            <span className="text-xl font-arabic text-[#f5f3f0] font-bold">{finalVoiceScript.split(/\s+/).length}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-medium text-[#6d6964] block font-bold">الوقت التقديري</span>
            <span className="text-xl font-arabic text-[#f5f3f0] font-bold">{Math.ceil(finalVoiceScript.split(/\s+/).length / 140)}m</span>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-medium text-[#6d6964] block font-bold">مزامنة الصوت</span>
            <span className="text-xs font-arabic text-green-600 flex items-center gap-2 font-bold "><CheckCircle2 size={12} /> مؤمّن</span>
          </div>
        </div>
      </motion.div>

      {/* SCENE BLOCKS */}
      <div className="space-y-8">
        <h3 className="text-sm font-medium text-[#6d6964] flex items-center gap-3 font-bold">
          <Layers size={16} /> Assembly Instruction Set
        </h3>
        {renderSceneCards}
      </div>
    </motion.div>
  );
};
