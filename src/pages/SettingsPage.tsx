import React, { useState, useEffect } from "react";
import { Cpu, Mic2, ShieldAlert, Youtube, Link as LinkIcon, CheckCircle2, User as UserIcon, Eye, Users as UsersIcon, Video } from "lucide-react";
import { motion } from "motion/react";
import { googleSignIn, logout, getAccessToken, initAuth } from "../lib/auth";
import { User } from "firebase/auth";
import { fetchChannelInfo, YouTubeChannelInfo } from "../services/youtubeService";
import { TTSConfigPanel } from "../components/TTSConfigPanel";

export default function SettingsPage() {
  const [useOllama, setUseOllama] = useState(() => {
    const stored = localStorage.getItem("useOllama");
    return stored !== "false";
  });
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    const stored = localStorage.getItem("ollamaUrl");
    return stored ? stored : "https://improvise-attire-giblet.ngrok-free.dev";
  });
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("ollamaModel") || "gemma4:31b-cloud");
  const [elevenLabsKey, setElevenLabsKey] = useState(() => localStorage.getItem("elevenLabsKey") || "");
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(() => localStorage.getItem("elevenLabsVoiceId") || "pNInz6obbfDQGcgMyIGC");
  const [conflictBias, setConflictBias] = useState(() => parseInt(localStorage.getItem("conflictBias") || "50"));
  const [selectiveRag, setSelectiveRag] = useState(() => localStorage.getItem("selectiveRag") !== "false");

  const [saved, setSaved] = useState(false);
  const [ytUser, setYtUser] = useState<User | null>(null);
  const [ytInfo, setYtInfo] = useState<YouTubeChannelInfo | null>(null);
  const [ytLoading, setYtLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (u, tk) => { 
        setYtUser(u); 
        const info = await fetchChannelInfo();
        setYtInfo(info);
        setYtLoading(false); 
      },
      () => { setYtUser(null); setYtInfo(null); setYtLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  const handleYtLogin = async () => {
    setYtLoading(true);
    try {
       const res = await googleSignIn();
       if (res) {
         setYtUser(res.user);
         const info = await fetchChannelInfo();
         setYtInfo(info);
       }
    } catch(e) {
       console.error(e);
    } finally {
       setYtLoading(false);
    }
  };

  const handleYtLogout = async () => {
    await logout();
    setYtUser(null);
    setYtInfo(null);
  };

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
    <div className="min-h-full font-arabic text-[#fafafa] space-y-6" dir="rtl">
      {/* Header Section */}
      <header className="bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 flex gap-4">
           <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#fafafa] mb-1 flex items-center gap-2">
                 <Cpu className="w-8 h-8 text-[#4f46e5]" />
                 [SETTINGS] // لوحة التكوين
              </h2>
              <p className="text-[#a1a1aa] font-mono text-xs leading-relaxed max-w-2xl mt-2 uppercase tracking-widest">إدارة تفضيلات الاستوديو وصلاحيات الحساب.</p>
           </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.98, backgroundColor: "rgba(240,199,34,0.8)" }}
          onClick={handleSave}
          className="bg-gradient-to-l from-[#4f46e5] to-[#6366f1] text-[#09090b] px-6 py-3 rounded-lg font-bold font-arabic hover:shadow-sm transition-all duration-300 flex items-center gap-2 active:scale-95 shrink-0 z-10"
        >
          {saved ? "تم التأمين" : "حفظ التغييرات"}
        </motion.button>
      </header>

      <div className="max-w-4xl space-y-12 relative z-10 bg-[#121214]  rounded-xl border border-[#27272a] p-8 shadow-sm">
        
         <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-[#27272a] pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-[#27272a]/50 border border-[#27272a] rounded">
                 <Youtube className="text-red-500 w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-[#fafafa] tracking-[0.2em] uppercase">يوتيوب - Youtube Link</h3>
           </div>
           
           <div className="p-8 bg-[#27272a]/50 border border-[#27272a] rounded relative">
                {ytLoading ? (
                    <div className="text-[10px] font-mono text-[#a1a1aa] animate-pulse uppercase">Checking Channel Connection...</div>
                ) : ytUser ? (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#4f46e5]/50">
                                    {ytUser.photoURL ? <img src={ytUser.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-[#a1a1aa]" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
                                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                                        القناة متصلة بنجاح
                                    </h4>
                                    <p className="text-[10px] font-mono text-[#a1a1aa] truncate max-w-xs">{ytUser.email}</p>
                                </div>
                            </div>
                            <button onClick={handleYtLogout} className="bg-[#121214]/80 border border-red-500/30 hover:border-red-500/80 text-red-400 px-4 py-2 text-xs font-arabic rounded-lg transition-all active:scale-95 shadow-sm">
                                فصل القناة (Disconnect)
                            </button>
                        </div>

                        {ytInfo && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-[#27272a]">
                                <div className="p-4 bg-[#121214]/40 border border-[#27272a] rounded space-y-1">
                                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                                        <UsersIcon size={12} />
                                        <span className="text-[9px] font-mono uppercase tracking-widest">Subscribers</span>
                                    </div>
                                    <div className="text-xl font-bold text-[#fafafa] font-mono">
                                        {Number(ytInfo.statistics.subscriberCount).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 bg-[#121214]/40 border border-[#27272a] rounded space-y-1">
                                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                                        <Eye size={12} />
                                        <span className="text-[9px] font-mono uppercase tracking-widest">Total Views</span>
                                    </div>
                                    <div className="text-xl font-bold text-[#fafafa] font-mono">
                                        {Number(ytInfo.statistics.viewCount).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-4 bg-[#121214]/40 border border-[#27272a] rounded space-y-1">
                                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                                        <Video size={12} />
                                        <span className="text-[9px] font-mono uppercase tracking-widest">Videos</span>
                                    </div>
                                    <div className="text-xl font-bold text-[#fafafa] font-mono">
                                        {Number(ytInfo.statistics.videoCount).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h4 className="text-xl font-bold block text-[#fafafa] tracking-wide mb-2 font-arabic">ربط قناة يوتيوب (YouTube Integration)</h4>
                        <p className="text-[10px] font-mono text-[#a1a1aa] leading-relaxed max-w-lg mb-6">قم بربط قناتك على يوتيوب بنقرة واحدة لتحميل الفيديوهات ونشرها ومتابعة الإحصائيات مباشرة من الاستوديو دون الحاجة إلى وضع أكواد معقدة (API Keys).</p>
                        <button onClick={handleYtLogin} className="gsi-material-button group bg-[#121214] border border-[#27272a] hover:border-[#4f46e5] shadow-sm p-3 rounded-lg flex items-center gap-4 transition-all active:scale-95">
                           <div className="w-6 h-6 flex-shrink-0">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                </svg>
                           </div>
                           <span className="font-arabic font-bold text-[#fafafa] group-hover:text-[#4f46e5] transition-colors text-sm">تسجيل الدخول عبر جوجل لمعالجة النشر</span>
                        </button>
                    </div>
                )}
           </div>
        </section>

        {/* AI Engine Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-[#27272a] pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-[#27272a]/50 border border-[#27272a] rounded">
                 <Cpu className="text-[#4f46e5] w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-[#fafafa] tracking-[0.2em] uppercase">نسيج_الذكاء</h3>
           </div>
           
           <div className="space-y-8">
              <div className="p-8 bg-[#27272a]/50 border border-[#27272a] rounded relative">
                 <label className="flex items-center gap-8 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={useOllama}
                        onChange={(e) => setUseOllama(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 border transition-all duration-300 rounded ${useOllama ? 'bg-[#4f46e5]/20 border-[#4f46e5]/50' : 'bg-[#121214]  border-[#4f46e5]/30'}`}>
                        <div className={`w-4 h-4 m-0.5 rounded transition-transform ${useOllama ? 'bg-[#4f46e5] translate-x-0' : 'bg-[#121214] /40 -translate-x-6'}`}></div>
                      </div>
                    </div>
                    <div>
                       <span className="text-xl font-bold block text-[#fafafa] tracking-wide mb-2 font-arabic">تفعيل المحرك المحلي (Ollama)</span>
                       <p className="text-[10px] font-mono text-[#a1a1aa] leading-relaxed max-w-lg">تجاوز معالجة السحابة وتشغيل النماذج مباشرة على الأجهزة المحلية لسيادة البيانات المطلقة.</p>
                    </div>
                 </label>
              </div>

              {useOllama && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 bg-[#27272a]/50 border border-[#27272a] rounded space-y-4">
                      <label className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest block font-bold">نقطة_النهاية_للخادم</label>
                      <input
                        type="text"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="w-full bg-transparent border-b border-[#27272a] py-2 font-mono text-[10px] text-[#fafafa] focus:outline-none focus:border-[#4f46e5] shadow-[0_1px_0_0_#3B82F6_inset] transition-all duration-300"
                        dir="ltr"
                      />
                   </div>
                   <div className="p-6 bg-[#27272a]/50 border border-[#27272a] rounded space-y-4">
                      <label className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest block font-bold">معرف_مصفوفة_النموذج</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["gemma2:9b-instruct-q4_0", "gemma4:31b-cloud", "llama3:8b", "mistral"].map(m => (
                          <button 
                             key={m} 
                             onClick={() => setOllamaModel(m)}
                             className={`px-2 py-1 text-[9px] font-mono border transition-all ${ollamaModel === m ? 'bg-[#4f46e5] border-[#4f46e5] text-black' : 'bg-[#121214]  border-[#27272a] shadow-sm border-[#27272a] text-[#a1a1aa] active:scale-95'}`}
                          >
                             {m.split(':')[0]}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="llama3.1"
                        className="w-full bg-transparent border-b border-[#27272a] py-2 font-mono text-[10px] text-[#fafafa] focus:outline-none focus:border-[#4f46e5] shadow-[0_1px_0_0_#3B82F6_inset] transition-all duration-300"
                        dir="ltr"
                      />
                   </div>
                </div>
              )}
           </div>
        </section>

        {/* Voice Generation Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-[#27272a] pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-[#27272a]/50 border border-[#27272a] rounded">
                 <Mic2 className="text-[#ef4444] w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-[#fafafa] tracking-[0.2em] uppercase">نواة_التوليف_الصوتي</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#27272a]/50 border border-[#27272a] rounded space-y-4">
                 <label className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest block font-bold">مفتاح_API_العصبي (ElevenLabs)</label>
                 <input
                   type="password"
                   value={elevenLabsKey}
                   onChange={(e) => setElevenLabsKey(e.target.value)}
                   placeholder="DECRYPTED_KEY_REQUIRED"
                   className="w-full bg-transparent border-b border-[#27272a] py-2 font-mono text-[10px] text-[#fafafa] focus:outline-none focus:border-[#ef4444] shadow-[0_1px_0_0_#ef4444_inset] transition-all duration-300"
                   dir="ltr"
                 />
              </div>
              <div className="p-6 bg-[#27272a]/50 border border-[#27272a] rounded space-y-4">
                 <label className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest block font-bold">بذرة_الهوية_الصوتية</label>
                 <input
                   type="text"
                   value={elevenLabsVoiceId}
                   onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                   placeholder="VOICE_HASH"
                   className="w-full bg-transparent border-b border-[#27272a] py-2 font-mono text-[10px] text-[#fafafa] focus:outline-none focus:border-[#ef4444] shadow-[0_1px_0_0_#ef4444_inset] transition-all duration-300"
                   dir="ltr"
                 />
              </div>
           </div>

           {/* Local TTS Config */}
           <TTSConfigPanel />
           
        </section>

        {/* Core RAG & Logic Settings */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-[#27272a] pb-4">
              <div className="w-6 h-6 flex items-center justify-center bg-[#27272a]/50 border border-[#27272a] rounded">
                 <ShieldAlert className="text-cyan-400 w-3 h-3" />
              </div>
              <h3 className="text-[10px] font-mono font-bold text-[#fafafa] tracking-[0.2em] uppercase">منطق_التحقيق_والمصادر</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
              {/* Selective RAG Activation */}
              <div className="p-8 bg-[#27272a]/50 border border-[#27272a] rounded relative">
                 <label className="flex items-center gap-8 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectiveRag}
                        onChange={(e) => setSelectiveRag(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 border transition-all duration-300 rounded ${selectiveRag ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-[#121214]  border-[#4f46e5]/30'}`}>
                        <div className={`w-4 h-4 m-0.5 rounded transition-transform ${selectiveRag ? 'bg-cyan-400 translate-x-0' : 'bg-[#121214] /40 -translate-x-6'}`}></div>
                      </div>
                    </div>
                    <div>
                       <span className="text-xl font-bold block text-[#fafafa] tracking-wide mb-2 font-arabic">الاسترجاع الانتقائي للمصادر (Selective RAG Activation)</span>
                       <p className="text-[10px] font-mono text-[#a1a1aa] leading-relaxed max-w-lg">يفتح أقبية المصادر بشكل انتقائي حسب موضوع المشهد الحالي، مما يقلل استهلاك الذاكرة العشوائية (VRAM 6GB) ويزيد سرعة الاستجابة.</p>
                    </div>
                 </label>
              </div>

              {/* Conflict Bias Slider */}
              <div className="p-8 bg-[#27272a]/50 border border-[#27272a] rounded relative space-y-6">
                 <div>
                    <span className="text-xl font-bold block text-[#fafafa] tracking-wide mb-2 font-arabic flex items-center justify-between">
                       سلايدر التناقض الدرامي (Conflict Bias)
                       <span className="text-accent-danger font-mono text-lg">{conflictBias}%</span>
                    </span>
                    <p className="text-[10px] font-mono text-[#a1a1aa] leading-relaxed max-w-lg">يتحكم في درجة إظهار التضارب والشذوذ بين المصادر والبحث عن ثغرات الروايات الرسمية.</p>
                 </div>
                 <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={conflictBias}
                      onChange={(e) => setConflictBias(parseInt(e.target.value))}
                      className="w-full accent-accent-danger bg-[#121214]  border-[#27272a] shadow-sm h-1 outline-none appearance-none cursor-pointer rounded-full"
                    />
                    <div className="flex justify-between mt-4 text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest">
                       <span>سرد محايد (إخباري)</span>
                       <span className="text-accent-danger">استقصائي هجومي (بحث عن الخلل)</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>
        
        <section className="pt-16 opacity-30 flex justify-center pb-8">
           <div className="flex items-center gap-4 px-6 py-3 border border-[#27272a] bg-[#27272a]/50 rounded">
              <ShieldAlert className="w-4 h-4 text-[#fafafa]" />
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-[#fafafa]/70">التشفير_النهائي_نشط</span>
           </div>
        </section>
      </div>
    </div>
  );
}
