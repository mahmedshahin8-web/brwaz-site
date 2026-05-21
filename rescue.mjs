import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const endChunk = `        ) : (
          /* SEARCH / RADAR VIEW */
          <div className="p-8 lg:p-32 space-y-40">
             <header className="mb-48">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                   <h2 className="text-4xl lg:text-9xl font-arabic font-black text-white tracking-tighter leading-none text-center">عن ماذا تبحث اليوم؟</h2>
                   <p className="text-white/40 font-arabic text-sm tracking-wide">ادخل عنوان البحث أو القضية الجدلية التي تود استخراج ملفاتها العميقة.</p>
                </div>

                <div className="max-w-4xl mx-auto relative group pt-20">
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-px h-20 bg-[#f0c722]/20" />
                   <input 
                     type="text"
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder="[ عنوان_الملف_مطلوب ]"
                     className="w-full bg-transparent border-b-2 border-white/[0.05] py-20 text-4xl lg:text-7xl font-arabic font-black focus:outline-none focus:border-[#f0c722] transition-none placeholder:text-white/[0.02] text-center text-white tracking-tight"
                     onKeyDown={(e) => e.key === 'Enter' && handleSpinRadar()}
                   />
                   
                   <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-24">
                      <button 
                        onClick={handleSpinRadar}
                        className="px-24 py-7 bg-[#f0c722] text-black font-mono font-black text-sm tracking-[0.5em] uppercase transition-none shadow-[0_30px_60px_rgba(212,175,55,0.1)] group relative overflow-hidden rounded-sm"
                      >
                        <Zap className="w-5 h-5 inline-block mr-3 fill-current" /> 
                        بدء_المعالجة
                      </button>

                      <button 
                        onClick={() => setShowMoodModal(true)}
                        className="flex items-center gap-6 px-14 py-7 p-8 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-sm relative overflow-hidden group transition-none cursor-pointer text-white font-mono font-black text-micro tracking-widest uppercase"
                      >
                        <Sparkles className="w-4 h-4 text-[#f0c722]" /> 
                        الحمض_الاستراتيجي: <span className="text-[#f0c722]">{mood}</span>
                      </button>
                   </div>
                </div>
             </header>

             <div className="flex flex-col lg:flex-row gap-24">
                {/* Control Sidebar */}
                <aside className="w-80 space-y-12 bg-[#050505]/60 backdrop-blur-xl border border-white/5 shrink-0 p-8 rounded-sm">
                   <header className="space-y-2 border-b border-white/5 pb-8 text-right">
                      <span className="text-micro font-mono text-white/30 uppercase tracking-[0.4em] font-bold">المعلمات_الاستراتيجية</span>
                      <h2 className="text-3xl font-arabic font-black text-white tracking-widest uppercase">مركز_التحكم</h2>
                   </header>

                   <section className="space-y-8">
                      <button 
                         onClick={() => setShowPersonaModal(true)}
                         className="w-full text-right p-8 bg-[#050505]/60 backdrop-blur-xl border border-white/5 transition-none relative group h-40 flex flex-col justify-between rounded-sm cursor-pointer"
                      >
                         <div className="absolute top-0 right-0 w-1 h-0 group-hover:h-full bg-[#f0c722] transition-all duration-500"></div>
                         <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">اختيار_الراوي</span>
                            <User className="w-5 h-5 text-[#f0c722]/30" />
                         </div>
                         <h4 className="text-3xl font-arabic font-black text-white tracking-tighter leading-none text-right">{persona}</h4>
                      </button>

                      <button 
                         onClick={() => setShowMoodModal(true)}
                         className="w-full text-right p-8 bg-[#050505]/60 backdrop-blur-xl border border-white/5 transition-none relative group h-40 flex flex-col justify-between rounded-sm cursor-pointer"
                      >
                         <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-[#f0c722]/60 uppercase tracking-widest font-black">الحمض_الاستراتيجي</span>
                            <Sparkles className="w-5 h-5 text-[#f0c722]/30" />
                         </div>
                         <h4 className="text-3xl font-arabic font-black text-white tracking-tighter leading-none text-right">{mood}</h4>
                      </button>

                      <div className="grid grid-cols-1 gap-4">
                         <div className="p-6 bg-[#050505]/60 backdrop-blur-xl border border-white/5 flex justify-between items-center rounded-sm">
                            <span className="text-[9px] font-mono text-white/20 uppercase">نواة_الذكاء</span>
                            <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-4">
                                  <div className="w-1.5 h-1.5 rounded-sm bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                  <span className="text-micro font-mono text-white/60 tracking-tighter uppercase font-bold text-right">الوضع_الأصيل</span>
                               </div>
                               <span className="text-[9px] text-white/40 font-mono">المحرك المسؤول عن السرد</span>
                            </div>
                         </div>
                         <div className="p-6 bg-[#050505]/60 backdrop-blur-xl border border-white/5 flex justify-between items-center rounded-sm">
                            <span className="text-[9px] font-mono text-white/20 uppercase">دقة_التصنيع</span>
                            <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-4">
                                  <div className="w-1.5 h-1.5 rounded-sm bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                  <span className="text-micro font-mono text-white/60 tracking-tighter uppercase font-bold text-right">عالي_الدقة</span>
                               </div>
                               <span className="text-[9px] text-white/40 font-mono">يمنع الهلوسة تماماً</span>
                            </div>
                         </div>
                      </div>
                   </section>
                </aside>

                <main className="flex-1 space-y-32">
                   {!topic && !suggestedTitles.length && (
                      <section className="space-y-16">
                         <div className="flex items-center justify-between border-b border-white/5 pb-10">
                            <div className="flex items-center gap-6">
                               <div className="w-3 h-3 bg-[#eb2630] rounded-sm animate-pulse"></div>
                               <h3 className="text-xs font-mono font-black text-white tracking-[0.5em] uppercase">اعتراض_الإشارات_الحرجة</h3>
                            </div>
                            <button onClick={handleSweepNow} className="px-4 py-2 bg-white/5 text-[9px] font-mono text-white/40 uppercase tracking-widest transition-none border border-white/5 hover:bg-white/10 rounded-sm">تحديث_النظام</button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {liveTrends.map((trend, i) => (
                              <motion.button
                                key={trend.id}
                                onClick={() => handleTrendSelect(trend)}
                                whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}
                                className={\`p-8 bg-[#050505]/60 backdrop-blur-xl border border-white/5 rounded-sm relative overflow-hidden group transition-none cursor-pointer text-right h-64 flex flex-col justify-between \${
                                  i % 4 === 0 ? 'md:col-span-2' : 'col-span-1'
                                }\`}
                              >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-[#eb2630] shadow-[0_0_15px_rgba(240,199,34,0.4)] -mr-10 -mt-10 rotate-45 transition-transform group-active:scale-125 duration-700 rounded-sm"></div>
                                <div className="z-10 text-right">
                                   <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] font-black block mb-4">إشارة_\${i+1}</span>
                                   <h5 className="text-2xl font-arabic font-black text-white leading-tight transition-colors line-clamp-3">{trend.title}</h5>
                                </div>
                                <div className="z-10 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
                                   <div className="flex-1 h-[2px] bg-white/5">
                                      <div className="h-full bg-[#eb2630]/40 w-[60%]"></div>
                                   </div>
                                   <span className="text-micro font-mono text-[#eb2630] font-black tracking-widest">{trend.velocity}</span>
                                </div>
                              </motion.button>
                            ))}
                         </div>
                      </section>
                   )}

                   {suggestedTitles.length > 0 && !data && (
                      <section className="space-y-24 animate-liquid">
                         <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-16">
                            <div className="text-right space-y-4">
                               <div className="flex items-center justify-end gap-4">
                                  <span className="text-[11px] font-mono text-[#f0c722] tracking-[0.5em] font-bold uppercase underline decoration-[#f0c722]/20 underline-offset-8">تم_استخراج_المخرجات</span>
                               </div>
                               <h3 className="text-7xl font-arabic font-black text-white tracking-tighter leading-none uppercase opacity-90">ملفات مقترحة</h3>
                            </div>
                            <button 
                              onClick={handleMergeTitles}
                              className="px-16 py-6 border border-[#f0c722]/20 text-[#f0c722] font-mono font-black text-xs tracking-[0.5em] uppercase transition-none relative group bg-[#050505]/60 backdrop-blur-xl rounded-sm hover:bg-white/5"
                            >
                              <Swords className="w-4 h-4 inline-block mr-3" />
                               مزامنة_المنظور
                            </button>
                         </header>

                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {suggestedTitles.map((t, i) => (
                               <motion.div
                                 key={t.id || i}
                                 onClick={() => handleGenerateEpisode(t.title)}
                                 whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}
                                 className="group p-12 bg-[#050505]/60 backdrop-blur-xl border border-white/5 relative cursor-pointer transition-none flex flex-col justify-between h-[420px] rounded-sm"
                               >
                                  <div className="absolute top-0 right-0 w-[1px] h-0 group-active:h-full bg-[#f0c722] transition-all duration-700"></div>
                                 
                                 <div className="flex justify-between items-start">
                                    <span className="text-micro font-mono text-white/20 uppercase tracking-[0.3em] font-bold">الزاوية::0{i+1}</span>
                                    <div className="w-10 h-10 border border-white/5 flex items-center justify-center rounded-sm">
                                       <Fingerprint className="w-5 h-5 text-white/20 group-active:text-[#f0c722] transition-colors" />
                                    </div>
                                 </div>

                                 <div className="space-y-6">
                                    <h4 className="text-3xl font-arabic font-black text-white tracking-tight leading-[1.1] transition-colors text-right">{t.title}</h4>
                                    <p className="text-sm font-arabic text-white/30 leading-relaxed line-clamp-3 border-r border-[#f0c722]/20 pr-6 text-right">
                                       {t.hook || "تحليل استقصائي لربط خيوط القضية واستخراج جوهر الحقيقة الكامن في طيات الأرشيف."}
                                    </p>
                                 </div>

                                 <footer className="pt-10 border-t border-white/5 flex justify-between items-center text-right">
                                    <div className="flex flex-col">
                                       <span className="text-[8px] font-mono text-white/20 uppercase mb-2">تأثير_محتمل</span>
                                       <div className="flex gap-2">
                                          {[1,2,3,4,5].map(b => <div key={b} className={\`w-4 h-1 rounded-sm \${b <= 4 ? 'bg-[#f0c722]/40' : 'bg-white/5'}\`} />)}
                                       </div>
                                    </div>
                                    <div className="w-12 h-12 flex items-center justify-center bg-[#f0c722]/10 rounded-sm transition-all border border-white/5">
                                       <ArrowRight className="w-5 h-5" />
                                    </div>
                                 </footer>
                               </motion.div>
                            ))}
                         </div>
                      </section>
                   )}
                </main>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isLoading || isGeneratingTitle) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-[#050505] flex flex-col items-center justify-center p-8 lg:p-24 overflow-hidden"
          >
             {/* Abstract Grid background for loading */}
             <div className="absolute inset-0 grid-pattern opacity-[0.02] scale-150 animate-pulse" />
             <div className="absolute top-0 left-0 w-full h-[2px] bg-[#f0c722]/20 shadow-[0_0_15px_rgba(240,199,34,0.4)] animate-scan z-10" />
             
             <div className="w-full max-w-5xl space-y-16 relative z-20">
                <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 border border-[#f0c722]/30 flex items-center justify-center bg-[#f0c722]/5 transform rotate-45 rounded-sm">
                       <Terminal className="w-10 h-10 text-[#f0c722] animate-pulse -rotate-45" />
                    </div>
                    <div className="text-right">
                       <div className="flex items-center gap-4 mb-3">
                          <div className="w-2 h-2 rounded-sm bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                          <h4 className="text-[11px] font-mono font-bold text-[#f0c722] tracking-[0.6em] uppercase underline decoration-[#f0c722]/20 underline-offset-4">التحليل_العميق_نشط</h4>
                       </div>
                       <div className="text-3xl font-arabic font-black text-white tracking-tighter" dir="rtl">
                          {status || "جارٍ استخراج البيانات الاستراتيجية..."}
                       </div>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                     <span className="text-7xl font-mono font-black text-white tracking-widest opacity-20">{progress}%</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-white/[0.05] overflow-hidden">
                   <motion.div 
                     className="h-full bg-[#f0c722]"
                     initial={{ width: 0 }}
                     animate={{ width: \`\${progress}%\` }}
                   />
                </div>

                <div className="bg-[#050505]/60 backdrop-blur-xl border border-white/5 p-12 font-mono text-[11px] leading-relaxed relative overflow-hidden h-[250px] flex flex-col justify-end rounded-sm">
                   <div className="absolute top-4 left-6 text-[9px] text-white/10 tracking-[0.4em] uppercase">دفق_السجل // المخرجات_الأساسية</div>
                   <div className="text-right space-y-3">
                      {(streamedChunk || "").split("\\n").slice(-6).map((line, i) => (
                        <div key={i} className="flex gap-6 justify-end items-center transition-opacity" style={{ opacity: 0.2 + (i * 0.15) }}>
                           <span className="text-white/60 tracking-tight underline decoration-[#f0c722]/10">{line}</span>
                           <span className="text-[#f0c722] font-bold">::[طلب_النظام]</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex justify-center pt-8">
                   <button 
                     onClick={handleStopGeneration} 
                     className="px-16 py-6 border border-white/5 text-white/30 text-micro font-mono tracking-[0.5em] uppercase transition-none flex items-center gap-4 rounded-sm hover:bg-white/5"
                   >
                     <Skull className="w-4 h-4" /> إلغاء_المهمة
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-12 z-[3000] flex items-center gap-6 bg-[#050505] border border-white/5 px-10 py-6 shadow-2xl rounded-sm"
          >
            <div className="w-12 h-12 border border-[#f0c722]/20 flex items-center justify-center bg-[#f0c722]/5 rounded-sm">
               <Zap className="w-6 h-6 text-[#f0c722] fill-current" />
            </div>
            <div className="text-right">
               <div className="text-micro font-mono text-[#f0c722] tracking-[0.4em] uppercase mb-1 font-bold">تغذية_الذكاء</div>
               <div className="text-base font-arabic font-black text-white tracking-tight">{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MoodSelectionModal 
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSelect={(m) => { setMood(m); setShowMoodModal(false); }}
        currentMood={mood}
      />

      <PersonaSelectionModal 
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        onSelect={(p) => { setPersona(p); setShowPersonaModal(false); }}
        currentPersona={persona}
      />
    </div>
  );
}

interface PersonaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (persona: PersonaType) => void;
  currentPersona: PersonaType;
}

const PersonaSelectionModal: React.FC<PersonaSelectionModalProps> = ({ isOpen, onClose, onSelect, currentPersona }) => {
  if (!isOpen) return null;
  const personas: { type: PersonaType; icon: any; title: string; description: string }[] = [
    { type: "النبّاش", icon: Search, title: "النبّاش", description: "محقق حاد يبحث خلف الكواليس ويفكك الأسرار بدقة صحفية." },
    { type: "برواز التاريخ", icon: BookOpen, title: "برواز التاريخ", description: "خبير أرشيفي يروي القصص بلمحة ملحمية وربط تاريخي عميق." },
    { type: "برواز التكنو", icon: Terminal, title: "برواز التكنو", description: "محلل مستقبلي يحذر من الوجه المظلم للتقنية بأسلوب رصين." },
    { type: "برواز الحكاوي", icon: Headphones, title: "برواز الحكاوي", description: "راوي قصص غامضة ومثيرة تعتمد على الفولكلور والحكاوي الشعبية." },
  ];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#050505] border border-white/5 p-10 lg:p-20 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#f0c722]/20" />
        <button onClick={onClose} className="absolute top-10 right-10 text-white/20 transition-none group hover:text-[#f0c722]">
          <X className="w-10 h-10 transition-transform group-hover:rotate-90" />
        </button>
        <header className="mb-20 text-right border-b border-white/5 pb-12">
          <h2 className="text-6xl font-arabic font-black text-white tracking-tighter mb-4">العدسة السردية</h2>
          <p className="text-[11px] font-mono text-[#f0c722] tracking-[0.6em] uppercase font-bold underline decoration-[#f0c722]/20 underline-offset-8">تحديد_هوية_الراوي_للملف</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {personas.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className={\`text-right p-10 transition-none relative group h-full rounded-sm \${
                currentPersona === p.type 
                ? 'bg-[#f0c722]/5 border border-[#f0c722]/40' 
                : 'bg-[#050505]/60 backdrop-blur-xl border border-white/5'
              }\`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                 <div className={\`w-14 h-14 flex items-center justify-center border rounded-sm \${currentPersona === p.type ? 'border-[#f0c722]/40 bg-[#f0c722]/10' : 'border-white/5 bg-white/[0.02]'}\`}>
                    <p.icon className={\`w-7 h-7 \${currentPersona === p.type ? 'text-[#f0c722]' : 'text-white/20'}\`} />
                 </div>
              </div>
              <h4 className={\`text-3xl font-arabic font-black mb-4 \${currentPersona === p.type ? 'text-[#f0c722]' : 'text-white'}\`}>{p.title}</h4>
              <p className="text-sm text-white/40 leading-relaxed font-arabic opacity-80">{p.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mood: MoodType) => void;
  currentMood: MoodType;
}

const MoodSelectionModal: React.FC<MoodSelectionModalProps> = ({ isOpen, onClose, onSelect, currentMood }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#050505] border border-white/5 p-10 lg:p-20 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded-sm">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#f0c722]/20" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#f0c722]/5 blur-[100px] rounded-sm" />
        
        <button onClick={onClose} className="absolute top-10 right-10 text-white/20 transition-none group hover:text-[#f0c722]">
          <X className="w-10 h-10 transition-transform group-hover:rotate-90" />
        </button>
        
        <header className="mb-20 text-right border-b border-white/5 pb-12">
          <h2 className="text-6xl font-arabic font-black text-white tracking-tighter mb-4">هوية المحتوى الاستراتيجي</h2>
          <p className="text-[11px] font-mono text-[#f0c722] tracking-[0.6em] uppercase font-bold underline decoration-[#f0c722]/20 underline-offset-8">ضبط_جوهر_الحمض_للأجواء</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {moods.map((m) => (
            <button
              key={m.type}
              onClick={() => onSelect(m.type)}
              className={\`text-right p-10 transition-none relative group h-full rounded-sm \${
                currentMood === m.type 
                ? 'bg-[#f0c722]/5 border border-[#f0c722]/40' 
                : 'bg-[#050505]/60 backdrop-blur-xl border border-white/5'
              }\`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                 {currentMood === m.type && (
                   <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[9px] font-mono text-[#f0c722] uppercase font-bold"
                   >
                     وضع_الملف_النشط
                   </motion.span>
                 )}
                 <div className={\`w-14 h-14 flex items-center justify-center border rounded-sm \${currentMood === m.type ? 'border-[#f0c722]/40 bg-[#f0c722]/10' : 'border-white/5 bg-white/[0.02]'}\`}>
                    <m.icon className={\`w-7 h-7 \${currentMood === m.type ? 'text-[#f0c722]' : 'text-white/20'}\`} />
                 </div>
              </div>
              <h4 className={\`text-3xl font-arabic font-black mb-4 \${currentMood === m.type ? 'text-[#f0c722]' : 'text-white'}\`}>{m.type}</h4>
              <p className="text-sm text-white/40 leading-relaxed font-arabic opacity-80">{m.description}</p>
              
              {currentMood === m.type && (
                <div className="absolute bottom-0 right-0 w-16 h-1 bg-[#f0c722] shadow-[0_0_15px_rgba(240,199,34,0.4)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
`;

const replaceTarget = '        ) : (';
const i1 = content.search(/        \) : \(\s*\/\* SEARCH \/ RADAR VIEW \*\//);

if (i1 !== -1) {
    content = content.substring(0, i1) + endChunk;
    fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
    console.log("FINAL CHUNK APPLIED!");
} else {
    console.log("Could not find the target string :(", i1);
}
