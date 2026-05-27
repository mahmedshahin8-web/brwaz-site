import React, { useState, useEffect } from "react";
import { Cpu, Mic2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [useOllama, setUseOllama] = useState(() => {
    const stored = localStorage.getItem("useOllama");
    return stored === null ? true : stored === "true";
  });
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    const stored = localStorage.getItem("ollamaUrl");
    return (stored && stored !== "http://127.0.0.1:11434") ? stored : "https://improvise-attire-giblet.ngrok-free.dev";
  });
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("ollamaModel") || "gemma4:31b-cloud");
  const [elevenLabsKey, setElevenLabsKey] = useState(() => localStorage.getItem("elevenLabsKey") || "");
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(() => localStorage.getItem("elevenLabsVoiceId") || "pNInz6obbfDQGcgMyIGC");
  const [conflictBias, setConflictBias] = useState(() => parseInt(localStorage.getItem("conflictBias") || "50"));
  const [selectiveRag, setSelectiveRag] = useState(() => localStorage.getItem("selectiveRag") !== "false");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("useOllama", useOllama ? "true" : "false");
    localStorage.setItem("ollamaUrl", ollamaUrl);
    localStorage.setItem("ollamaModel", ollamaModel);
    localStorage.setItem("elevenLabsKey", elevenLabsKey);
    localStorage.setItem("elevenLabsVoiceId", elevenLabsVoiceId);
    localStorage.setItem("conflictBias", conflictBias.toString());
    localStorage.setItem("selectiveRag", selectiveRag ? "true" : "false");
  }, [useOllama, ollamaUrl, ollamaModel, elevenLabsKey, elevenLabsVoiceId, conflictBias, selectiveRag]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="text-gray-900 font-arabic" dir="rtl">
      {/* Header Section */}
      <header className="mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-2 h-8 bg-blue-600 rounded-sm shadow-[0_0_15px_rgba(240,199,34,0.4)]" />
           <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">نواة النظام: لـوحة التكوين</span>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
           <div>
              <h2 className="text-4xl font-black tracking-widest text-gray-900 leading-none font-arabic uppercase">الإعدادات</h2>
              <p className="text-[10px] text-gray-600 font-mono tracking-[0.2em] uppercase mt-4">معايرة محركات النظام وتأمين الاتصالات</p>
           </div>
           <motion.button 
             whileTap={{ scale: 0.98, backgroundColor: "rgba(240,199,34,0.8)" }}
             onClick={handleSave}
             className="px-8 py-4 bg-blue-600 text-[#ffffff] font-mono font-bold text-[10px] tracking-widest uppercase rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center transition-all duration-300"
           >
             {saved ? "تم_التأمين" : "حفظ_التغييرات"}
           </motion.button>
        </div>
      </header>

      <div className="max-w-4xl space-y-12 relative z-10">
        
        {/* AI Engine Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                 <Cpu className="text-blue-600 w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-gray-900 tracking-[0.2em] uppercase">نسيج_الذكاء</h3>
           </div>
           
           <div className="space-y-8">
              <div className="p-8 bg-gray-50 border border-gray-200 rounded-sm relative">
                 <label className="flex items-center gap-8 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={useOllama}
                        onChange={(e) => setUseOllama(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 border transition-all duration-300 rounded-sm ${useOllama ? 'bg-blue-600/20 border-blue-500/50' : 'bg-white border-gray-300'}`}>
                        <div className={`w-4 h-4 m-0.5 rounded-sm transition-transform ${useOllama ? 'bg-blue-600 translate-x-0' : 'bg-white/40 -translate-x-6'}`}></div>
                      </div>
                    </div>
                    <div>
                       <span className="text-xl font-bold block text-gray-900 tracking-wide mb-2 font-arabic">تفعيل المحرك المحلي (Ollama)</span>
                       <p className="text-[10px] font-mono text-gray-600 leading-relaxed max-w-lg">تجاوز معالجة السحابة وتشغيل النماذج مباشرة على الأجهزة المحلية لسيادة البيانات المطلقة.</p>
                    </div>
                 </label>
              </div>

              {useOllama && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm space-y-4">
                      <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block font-bold">نقطة_النهاية_للخادم</label>
                      <input
                        type="text"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-[10px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-[0_1px_0_0_#3B82F6_inset] transition-all duration-300"
                        dir="ltr"
                      />
                   </div>
                   <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm space-y-4">
                      <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block font-bold">معرف_مصفوفة_النموذج</label>
                      <input
                        type="text"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="llama3.1"
                        className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-[10px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-[0_1px_0_0_#3B82F6_inset] transition-all duration-300"
                        dir="ltr"
                      />
                   </div>
                </div>
              )}
           </div>
        </section>

        {/* Voice Generation Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                 <Mic2 className="text-[#eb2630] w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-gray-900 tracking-[0.2em] uppercase">نواة_التوليف_الصوتي</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm space-y-4">
                 <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block font-bold">مفتاح_API_العصبي</label>
                 <input
                   type="password"
                   value={elevenLabsKey}
                   onChange={(e) => setElevenLabsKey(e.target.value)}
                   placeholder="DECRYPTED_KEY_REQUIRED"
                   className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-[10px] text-gray-900 focus:outline-none focus:border-[#eb2630] shadow-[0_1px_0_0_#eb2630_inset] transition-all duration-300"
                   dir="ltr"
                 />
              </div>
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-sm space-y-4">
                 <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest block font-bold">بذرة_الهوية_الصوتية</label>
                 <input
                   type="text"
                   value={elevenLabsVoiceId}
                   onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                   placeholder="VOICE_HASH"
                   className="w-full bg-transparent border-b border-gray-200 py-2 font-mono text-[10px] text-gray-900 focus:outline-none focus:border-[#eb2630] shadow-[0_1px_0_0_#eb2630_inset] transition-all duration-300"
                   dir="ltr"
                 />
              </div>
           </div>
        </section>

        {/* Core RAG & Logic Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">
                 <ShieldAlert className="text-cyan-400 w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-gray-900 tracking-[0.2em] uppercase">منطق_التحقيق_والمصادر</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
              {/* Selective RAG Activation */}
              <div className="p-8 bg-gray-50 border border-gray-200 rounded-sm relative">
                 <label className="flex items-center gap-8 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectiveRag}
                        onChange={(e) => setSelectiveRag(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 border transition-all duration-300 rounded-sm ${selectiveRag ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white border-gray-300'}`}>
                        <div className={`w-4 h-4 m-0.5 rounded-sm transition-transform ${selectiveRag ? 'bg-cyan-400 translate-x-0' : 'bg-white/40 -translate-x-6'}`}></div>
                      </div>
                    </div>
                    <div>
                       <span className="text-xl font-bold block text-gray-900 tracking-wide mb-2 font-arabic">الاسترجاع الانتقائي للمصادر (Selective RAG Activation)</span>
                       <p className="text-[10px] font-mono text-gray-600 leading-relaxed max-w-lg">يفتح أقبية المصادر بشكل انتقائي حسب موضوع المشهد الحالي، مما يقلل استهلاك الذاكرة العشوائية (VRAM 6GB) ويزيد سرعة الاستجابة.</p>
                    </div>
                 </label>
              </div>

              {/* Conflict Bias Slider */}
              <div className="p-8 bg-gray-50 border border-gray-200 rounded-sm relative space-y-6">
                 <div>
                    <span className="text-xl font-bold block text-gray-900 tracking-wide mb-2 font-arabic flex items-center justify-between">
                       سلايدر التناقض الدرامي (Conflict Bias)
                       <span className="text-accent-danger font-mono text-lg">{conflictBias}%</span>
                    </span>
                    <p className="text-[10px] font-mono text-gray-600 leading-relaxed max-w-lg">يتحكم في درجة إظهار التضارب والشذوذ بين المصادر والبحث عن ثغرات الروايات الرسمية.</p>
                 </div>
                 <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={conflictBias}
                      onChange={(e) => setConflictBias(parseInt(e.target.value))}
                      className="w-full accent-accent-danger bg-white border-gray-100 shadow-sm h-1 outline-none appearance-none cursor-pointer rounded-full"
                    />
                    <div className="flex justify-between mt-4 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                       <span>سرد محايد (إخباري)</span>
                       <span className="text-accent-danger">استقصائي هجومي (بحث عن الخلل)</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>
        
        <section className="pt-16 opacity-30 flex justify-center pb-8">
           <div className="flex items-center gap-4 px-6 py-3 border border-gray-200 bg-gray-50 rounded-sm">
              <ShieldAlert className="w-4 h-4 text-gray-900" />
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-gray-900/70">التشفير_النهائي_نشط</span>
           </div>
        </section>
      </div>
    </div>
  );
}
