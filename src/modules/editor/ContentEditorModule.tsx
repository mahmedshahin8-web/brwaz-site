import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EditorContent } from "@tiptap/react";
import { MasterOutline, EpisodeData } from "../../types";
import { Copy, Volume2, Square, Eye, Archive, Maximize2, Minimize2, Database, Layers, CheckCircle2, Sparkles, Zap, MessageSquare, Download, Activity, Search } from "lucide-react";
import { ScriptEvaluator } from "../../components/ScriptEvaluator";
import { copyToClipboard, exportProjectZip } from "../../lib/exportUtils";
import { generateAIContentRaw } from "../../lib/gemini";

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
  generationTook?: number | null;
}

const DAHEEH_SLANGS = [
  "يا عزيزي المشاهد",
  "حبيبي المستمع",
  "مفيش حاجة صدفة يا بيه",
  "هل دي النهاية؟ أكيد لأ",
  "الموضوع أكبر من كده بكتير",
  "لكن استنى... القصة مخلصتش هنا",
  "المفاجأة بقى فين؟",
  "الجميل في الموضوع إن...",
  "عشان تفهم حجم الكارثة...",
  "وهنا يجي السؤال الأهم...",
  "ده اللي إنت هتشوفه، لكن اللي ورا الستارة..."
];

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
  const [activeTab, setActiveTab] = useState<"archive" | "slang">("archive");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const wordsCount = finalVoiceScript.trim() ? finalVoiceScript.split(/\s+/).length : 0;
  const timeEstMin = Math.ceil(wordsCount / 140);

  const calculatePacingScore = () => {
    if (!finalVoiceScript) return 0;
    const sentences = finalVoiceScript.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    // Variance in sentence length is good pacing
    const lengths = sentences.map(s => s.split(' ').length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const score = Math.min(Math.round((variance / 15) * 100), 100);
    return score;
  };

  const handleAiAction = async (actionType: 'autocomplete' | 'joke') => {
    if (!editor || isAiLoading) return;
    setIsAiLoading(true);
    
    try {
      const selection = editor.state.selection;
      const textRange = editor.state.doc.textBetween(Math.max(0, selection.from - 500), selection.to, ' ');
      
      let prompt = "";
      if (actionType === 'autocomplete') {
        prompt = `أنت الكاتب المساعد لبرنامج الدحيح. أكمل هذه الجملة بنفس السياق والأسلوب الشيق (بدون تكرار الموجود):\n"${textRange}"`;
      } else if (actionType === 'joke') {
        prompt = `أنت الكاتب المساعد لبرنامج الدحيح. أضف إيفيه (نكتة) قصيرة أو مرجع للثقافة الشعبية مناسب لهذا السياق:\n"${textRange}"`;
      }

      const response = await generateAIContentRaw(prompt, null, useOllama ? "ollama" : "gemini");
      
      editor.chain().focus().insertContent(` ${response} `).run();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const insertSlang = (slang: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(` ${slang} `).run();
  };

  // Export as 2-column Script format TSV
  const exportScriptTSV = () => {
    const scenes = data.scenes || [];
    let tsv = "Visual (B-Roll/Camera)\tAudio (Voiceover)\n";
    scenes.forEach(scene => {
      tsv += `${scene.visual_cue}\t${scene.voice_over}\n`;
    });
    
    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Daheeh_Script_${data.video_title.replace(/\s+/g, "_")}.tsv`;
    a.click();
  };

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
        {/* TOP CONTROL BAR */}
        <div className={`flex justify-between items-center ${isFocusMode ? 'border-b border-[#17202c] pb-4 mb-12' : 'bg-[#17202c]/50 p-4 -mt-10 -mx-10 border-b border-[#17202c] mb-8 rounded-t-3xl'}`}>
          <div className="flex gap-2 items-center text-[10px] font-mono text-[#d4a574] uppercase tracking-widest font-black">
            <span>غرفة العمليات {isFocusMode ? '(Focus Mode)' : '(Desktop)'}</span>
            {isAiLoading && (
               <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded animate-pulse">
                 <Zap size={10} /> AI THINKING...
               </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className={`px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors ${isFocusMode ? 'text-[#c89b5a] bg-[#17202c]/50' : 'text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574]'} text-[10px] font-bold uppercase font-mono tracking-wider`} title="وضع التركيز">
              {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
              {isFocusMode ? 'خروج' : 'تركيز'}
            </button>
            <button onClick={() => setShowTeleprompter(true)} className="px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574] text-[10px] font-bold uppercase font-mono tracking-wider" title="الوضع التلقيني">
              <Eye size={14} /> Teleprompter
            </button>
            <button onClick={handlePlayVoice} className="w-10 h-10 border border-[#17202c] rounded-xl flex items-center justify-center active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#d4a574]">
              {isPlayingVoice ? <Square size={14} className="fill-current" /> : <Volume2 size={16} />}
            </button>
            <button onClick={() => copyToClipboard(finalVoiceScript, "نسخ السكريبت للمونتير")} className="px-3 h-10 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#6d6964] bg-[#111722]/60 hover:text-[#2b5797] text-[10px] font-bold uppercase font-mono tracking-wider" title="نسخ السكريبت كامل للمونتير">
              <Copy size={14} /> نسخ السكريبت
            </button>
          </div>
        </div>

        {/* AI TOOLBAR */}
        <div className={`flex justify-end gap-2 ${isFocusMode ? 'max-w-4xl mx-auto' : ''}`}>
          <button 
             onClick={() => handleAiAction("autocomplete")}
             disabled={isAiLoading}
             className="px-3 py-1.5 bg-[#a0764d]/10 hover:bg-[#a0764d]/20 text-[#d4a574] border border-[#a0764d]/30 rounded-lg text-xs font-arabic flex items-center gap-2 transition-colors disabled:opacity-50"
          >
             <Sparkles size={14} /> كمل بأسلوب الدحيح
          </button>
          <button 
             onClick={() => handleAiAction("joke")}
             disabled={isAiLoading}
             className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-arabic flex items-center gap-2 transition-colors disabled:opacity-50"
          >
             <Zap size={14} /> أضف إيفيه
          </button>
        </div>

        <div className={`flex flex-row-reverse gap-8 ${isFocusMode ? '' : 'border-t border-[#17202c] pt-4'}`}>
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
                <div className="flex gap-2 border-b border-[#17202c] pb-3">
                  <button 
                    onClick={() => setActiveTab("archive")}
                    className={`text-[11px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 pb-2 -mb-[13px] ${activeTab === 'archive' ? 'text-[#c89b5a] border-b-2 border-[#c89b5a]' : 'text-[#6d6964] hover:text-[#f5f3f0]'}`}
                  >
                    <Archive size={14} /> أرشيف 
                  </button>
                  <button 
                    onClick={() => setActiveTab("slang")}
                    className={`text-[11px] font-mono uppercase tracking-widest font-bold flex items-center gap-2 pb-2 -mb-[13px] ${activeTab === 'slang' ? 'text-[#c89b5a] border-b-2 border-[#c89b5a]' : 'text-[#6d6964] hover:text-[#f5f3f0]'}`}
                  >
                    <MessageSquare size={14} /> الإيفيهات
                  </button>
                </div>

                {activeTab === "archive" ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-[#111722]/60 backdrop-blur-md p-5 border border-[#17202c] rounded-xl hover:shadow-deep hover:border-[#a0764d]/30 transition-all cursor-pointer relative group flex flex-col gap-2">
                        <div className="absolute top-0 right-0 w-1 h-full bg-[#a0764d] rounded-r-xl"></div>
                        <h5 className="font-bold text-[#f5f3f0] text-sm">الرواية الرسمية</h5>
                        <p className="text-xs text-[#6d6964] leading-relaxed font-arabic line-clamp-4 group-hover:line-clamp-none transition-all">
                            {researchMap?.core_conflict_or_mystery || "جاري جلب الروايات من الأرشيف..."}
                        </p>
                    </div>
                    <div className="bg-[#111722]/60 backdrop-blur-md p-5 border border-[#17202c] rounded-xl hover:shadow-deep hover:border-red-200 transition-all cursor-pointer relative group flex flex-col gap-2">
                        <div className="absolute top-0 right-0 w-1 h-full bg-red-500 rounded-r-xl"></div>
                        <h5 className="font-bold text-[#f5f3f0] text-sm">هجوم الأعداء / النقيض</h5>
                        <p className="text-xs text-[#6d6964] leading-relaxed font-arabic line-clamp-4 group-hover:line-clamp-none transition-all">
                            {researchMap?.hidden_patterns_or_contradictions?.[0] || researchMap?.editorial_angle || "لا توجد أدلة مضادة متوفرة حالياً."}
                        </p>
                    </div>

                    {data.archival_search_queries && (
                      <div className="mt-6 border-t border-[#17202c] pt-4">
                        <h4 className="text-[10px] font-mono text-[#a0764d] uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Search size={12}/> Archival Layers</h4>
                        
                        <div className="space-y-3">
                          {data.archival_search_queries.primary_documents && data.archival_search_queries.primary_documents.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#6d6964] block">Primary Documents</span>
                              {data.archival_search_queries.primary_documents.map((q, i) => <div key={i} className="text-xs text-[#f5f3f0] bg-[#17202c] p-2 rounded">{q}</div>)}
                            </div>
                          )}
                          {data.archival_search_queries.gritty_realism && data.archival_search_queries.gritty_realism.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#6d6964] block">Gritty Realism</span>
                              {data.archival_search_queries.gritty_realism.map((q, i) => <div key={i} className="text-xs text-[#f5f3f0] bg-[#17202c] p-2 rounded">{q}</div>)}
                            </div>
                          )}
                          {data.archival_search_queries.visual_metaphors && data.archival_search_queries.visual_metaphors.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-[#6d6964] block">Visual Metaphors</span>
                              {data.archival_search_queries.visual_metaphors.map((q, i) => <div key={i} className="text-xs text-[#f5f3f0] bg-[#17202c] p-2 rounded">{q}</div>)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-10">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold mb-3">شعار الدحيح والقفلات</span>
                      {DAHEEH_SLANGS.slice(0, 5).map((slang, idx) => (
                        <button
                          key={'a'+idx}
                          onClick={() => insertSlang(slang)}
                          className="w-full text-right bg-[#111722]/60 hover:bg-[#a0764d]/10 p-3 border border-[#17202c] hover:border-[#a0764d]/30 rounded-xl text-sm text-[#f5f3f0] font-arabic transition-all flex justify-between items-center group"
                        >
                          <span>{slang}</span>
                          <Zap size={14} className="text-[#a0764d] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-[#17202c]">
                      <span className="text-[10px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold mb-3">ربط وعلامات تعجب</span>
                      {DAHEEH_SLANGS.slice(5).map((slang, idx) => (
                        <button
                          key={'b'+idx}
                          onClick={() => insertSlang(slang)}
                          className="w-full text-right bg-[#111722]/60 hover:bg-[#a0764d]/10 p-3 border border-[#17202c] hover:border-[#a0764d]/30 rounded-xl text-sm text-[#f5f3f0] font-arabic transition-all flex justify-between items-center group"
                        >
                          <span>{slang}</span>
                          <Zap size={14} className="text-[#a0764d] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-[#17202c]">
                      <span className="text-[10px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold mb-3">مؤثرات صوتية (SFX Injector)</span>
                      {[
                        "[SFX: تأتأة سينمائية (Whoosh)]",
                        "[SFX: صوت خدش اسطوانة (Record Scratch)]",
                        "[SFX: دقات قلب تتسارع]",
                        "[SFX: صمت مفاجئ (Silence)]",
                        "[SFX: موسيقى تشويق تتصاعد]"
                      ].map((sfx, idx) => (
                        <button
                          key={'c'+idx}
                          onClick={() => insertSlang(sfx)}
                          className="w-full text-right bg-[#1f1e2e]/60 hover:bg-[#4f46e5]/10 p-2 border border-[#4f46e5]/20 hover:border-[#4f46e5]/50 rounded-xl text-xs text-[#a5b4fc] font-mono transition-all flex justify-between items-center group"
                        >
                          <span>{sfx}</span>
                          <Volume2 size={12} className="text-[#4f46e5] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    <h4 className="text-[10px] font-mono text-[#6d6964] uppercase tracking-widest border-b border-[#17202c] pb-3 text-left font-bold flex items-center gap-2">
                      <Database size={12}/> Verified Sources
                    </h4>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                      {data.sources.map((src, i) => {
                          const s = typeof src === 'string' ? { title: src, url: '#' } : src;
                          return (
                            <div key={i} className="space-y-1 group text-left">
                                <span className="text-[8px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold">[SOURCE {i+1}]</span>
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
                        <span className="text-[9px] font-mono text-[#6d6964] italic">No citations found.</span>
                      )}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={`flex gap-10 overflow-hidden ${isFocusMode ? 'fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-4 bg-[#0a0e14] border-t border-[#17202c] z-[110]' : 'pt-8 border-t border-[#17202c]'} items-center`}>
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold">Words Total</span>
            <span className="text-xl font-mono text-[#f5f3f0] font-bold">{wordsCount}</span>
          </div>
          <div className="space-y-1 border-l border-[#17202c] pl-10">
            <span className="text-[8px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold">Time Est</span>
            <span className="text-xl font-mono text-[#f5f3f0] font-bold">{timeEstMin}m</span>
          </div>
          <div className="space-y-1 border-l border-[#17202c] pl-10">
            <span className="text-[8px] font-mono text-[#6d6964] uppercase tracking-widest block font-bold text-center">Pacing Range</span>
            <div className="flex items-center gap-2">
               <Activity size={16} className={calculatePacingScore() > 50 ? "text-green-500" : "text-amber-500"} />
               <span className="text-xl font-mono text-[#f5f3f0] font-bold">{calculatePacingScore()}/100</span>
            </div>
          </div>
           <div className="space-y-1 border-l border-[#17202c] pl-10 flex-1 flex flex-wrap justify-end gap-2">
             <button onClick={exportScriptTSV} className="px-4 py-2 border border-[#17202c] rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#6d6964] hover:text-[#f5f3f0] hover:bg-[#111722] text-xs font-mono font-bold uppercase">
               <Download size={14} /> اسحب الاسكربت
             </button>
             <button onClick={() => exportProjectZip(data)} className="px-4 py-2 border border-[#a0764d]/30 bg-[#a0764d]/10 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-colors text-[#d4a574] hover:bg-[#a0764d]/20 text-xs font-mono font-bold uppercase">
               <Download size={14} /> اطبع ورق الحلقة يا ابني (الكل)
             </button>
          </div>
        </div>
      </motion.div>

      {/* SCENE BLOCKS */}
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-mono text-[#6d6964] uppercase tracking-widest flex items-center gap-3 font-bold">
            <Layers size={16} /> Assembly Instruction Set
          </h3>
        </div>
        {renderSceneCards}
      </div>
    </motion.div>
  );
};

