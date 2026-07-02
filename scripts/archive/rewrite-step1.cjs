const fs = require('fs');
let code = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const startMarker = '{/* PIPELINE CONTAINER */}';
const startIndex = code.indexOf(startMarker);

const endMarker = '{/* MICRO ANIMATION BEFORE PRODUCTION */}';
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const top = code.slice(0, startIndex);
const bottom = code.slice(endIndex);

const replacement = `{/* PIPELINE CONTAINER */}
      <div className="relative z-10 w-full flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {pipelineStep === 1 && (
             <motion.div
               key="step1-command-center"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1500px] w-full mx-auto py-2"
             >
                {/* Center Column: Huge Input Area */}
                <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1 relative">
                    <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2rem] -z-10 pointer-events-none" />
                    
                    <div className="flex flex-col gap-1 mb-2">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-md w-fit mb-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
                           <span className="text-[10px] text-[#a1a1aa] font-mono tracking-[0.2em] uppercase">Studio.OS Core Active</span>
                       </div>
                       <h2 className="text-3xl lg:text-5xl font-bold font-arabic text-white tracking-tight leading-tight drop-shadow-sm">
                         مساحة العمل الإبداعية
                       </h2>
                       <p className="text-white/40 text-sm font-medium mt-2 max-w-xl leading-relaxed">
                         حدد الشكل الفني من القائمة، ثم اسرد فكرتك أو قم برفع مصادر البحث. سيقوم المحرك ببناء الرؤية الدرامية كاملة.
                       </p>
                    </div>

                    <div className="relative group mt-4">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#4f46e5]/10 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 rounded-[2rem]" />
                        <div className="p-1 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
                          <textarea
                            placeholder="ما هي الفكرة التي تود استكشافها والعمل عليها اليوم؟ (لرفع ملف وورد، استخدم الزر أدناه)"
                            className="w-full min-h-[300px] bg-transparent border-0 rounded-3xl p-8 text-2xl lg:text-3xl font-arabic font-medium leading-relaxed text-white placeholder:text-white/20 transition-all outline-none resize-none custom-scrollbar"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                          />
                          
                          <div className="absolute bottom-6 right-6 flex items-center gap-3">
                             <label className="group/btn flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all">
                               <FileText className="w-4 h-4 text-white/50 group-hover/btn:text-[#4f46e5] transition-colors" />
                               <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold">DOCX</span>
                               <input 
                                 type="file" accept=".docx" className="hidden"
                                 onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (!file) return;
                                   try {
                                     const buffer = await file.arrayBuffer();
                                     const mammoth = await import("mammoth");
                                     const result = await mammoth.extractRawText({ arrayBuffer: buffer });
                                     if (result.value) {
                                        setTopic(prev => prev + (prev ? '\\n\\n' : '') + result.value);
                                     } else {
                                        alert("لم يتم العثور على نص في هذا الملف.");
                                     }
                                   } catch (err) {
                                     console.error('Docx parsing error:', err);
                                     alert("خطأ في قراءة ملف الوورد.");
                                   }
                                   e.target.value = '';
                                 }}
                               />
                             </label>
                             <label className="group/btn flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all">
                               {isUploadingPDF ? <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" /> : <FileBox className="w-4 h-4 text-white/50 group-hover/btn:text-[#4f46e5] transition-colors" />}
                               <span className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold">PDF (RAG)</span>
                               <input 
                                 type="file" accept=".pdf" className="hidden" disabled={isUploadingPDF}
                                 onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (!file) return;
                                   setIsUploadingPDF(true);
                                   try {
                                     const formData = new FormData();
                                     formData.append('file', file);
                                     const res = await fetch((process.env.VITE_API_URL || 'http://localhost:3000') + '/api/rag-upload', {
                                       method: 'POST',
                                       body: formData
                                     });
                                     if (!res.ok) throw new Error('فشل الرفع');
                                     const data = await res.json();
                                     alert('تم المعالجة وتم استخراج: ' + data.chunks + ' فقرة.');
                                   } catch (err) {
                                     alert('خطأ أثناء المعالجة.');
                                   } finally {
                                     setIsUploadingPDF(false);
                                   }
                                   e.target.value = '';
                                 }}
                               />
                             </label>
                          </div>
                          <div className="absolute bottom-6 left-6">
                            <button
                               onClick={() => {
                                 if (!creatorMode) {
                                     alert("الرجاء اختيار القالب الإنتاجي أولاً من القائمة الجانبية.");
                                     return;
                                 }
                                 handleBrainstorming();
                               }}
                               disabled={!topic.trim() || isBrainstorming}
                               className="px-8 py-3 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white rounded-xl font-bold font-arabic shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                             >
                               {isBrainstorming ? (
                                  <>
                                     <Loader2 className="w-5 h-5 animate-spin" />
                                     <span>يتم التحليل...</span>
                                  </>
                               ) : (
                                  <>
                                     <Zap fill="currentColor" strokeWidth={0} className="w-4 h-4" />
                                     <span>تهيئة المحرك</span>
                                  </>
                               )}
                             </button>
                          </div>
                        </div>
                    </div>
                    
                    {/* Angles Selector (if brainstorming done) */}
                    <AnimatePresence>
                      {generatedAngles.length > 0 && (
                          <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 flex flex-col gap-4"
                          >
                             <div className="flex items-center gap-2 px-2 text-[#4f46e5] text-sm font-bold">
                               <Tv className="w-4 h-4" />
                               <span>اكتمل التحليل. اختر الزاوية الملائمة لبدء الإنتاج:</span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {generatedAngles.map((st, i) => (
                                 <div key={i} className="flex flex-col gap-1">
                                   <button
                                     onClick={() => {
                                        const hookVal = st.hook || st.hook_instruction || "";
                                        setSelectedAngle(st.title);
                                        setGeneratedAngles([]);
                                        setIsTransitioning(true);
                                        playClick();
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                        setTimeout(() => {
                                          setIsTransitioning(false);
                                          setPipelineStep(3);
                                          handleGenerateEpisode(st.title, hookVal, st.title);
                                        }, 2000);
                                     }}
                                     className="text-right p-5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-[#4f46e5]/40 hover:bg-[#4f46e5]/5 transition-all group shadow-sm hover:shadow-[0_4px_20px_rgba(79,70,229,0.1)] flex flex-col gap-3 w-full"
                                   >
                                     <div className="flex justify-between items-start w-full">
                                        <h5 className="text-base font-arabic font-bold text-white group-active:scale-95 transition-transform">{st.title}</h5>
                                        <span className="text-xl font-mono text-white/10 group-hover:text-[#4f46e5]/40 font-bold -mt-1 transition-colors">0{i+1}</span>
                                     </div>
                                     <p className="text-xs font-arabic text-[#a1a1aa] leading-relaxed line-clamp-2 uppercase">"{st.hook || st.hook_instruction}"</p>
                                     <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Select Angle</span>
                                        <ArrowRight className="w-4 h-4 text-[#4f46e5] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all -rotate-180" />
                                     </div>
                                   </button>
                                   <button
                                     onClick={() => {
                                       const hookVal = st.hook || st.hook_instruction || "";
                                       startDeepResearch(\`\${st.title} - \${hookVal}\`);
                                     }}
                                     className="w-full flex items-center justify-center gap-2 p-3 bg-black/60 border border-white/5 rounded-xl hover:border-[#4f46e5]/50 hover:text-[#4f46e5] text-[#a1a1aa] transition-colors"
                                   >
                                       <Search className="w-4 h-4" />
                                       <span className="text-[10px] font-mono leading-tight">بحث استقصائي (Deep Research)</span>
                                   </button>
                                 </div>
                               ))}
                             </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Format Config */}
                <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.04] rounded-3xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                           <LayoutTemplate className="w-5 h-5 text-white/40" />
                           <h3 className="text-white text-lg font-bold tracking-wide">قالب الإخراج <span className="text-white/30 font-sans tracking-widest text-[10px] uppercase ml-2 block">Format</span></h3>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                           <button
                             onClick={() => { setCreatorMode("documentary"); setIsLongForm(true); setDuration(12); playClick(); }}
                             className={\`flex items-start gap-4 p-5 rounded-2xl border transition-all text-right \${creatorMode === 'documentary' ? 'bg-[#4f46e5]/5 border-[#4f46e5]/40 shadow-[inner_0_0_20px_rgba(79,70,229,0.1)]' : 'bg-transparent border-white/5 hover:border-white/20 hover:bg-white/5'}\`}
                           >
                             <div className={\`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border \${creatorMode === 'documentary' ? 'bg-[#4f46e5]/20 border-[#4f46e5]/40 text-[#4f46e5]' : 'bg-white/5 border-white/10 text-white/40'}\`}>
                                <MonitorPlay size={24} strokeWidth={1.5} />
                             </div>
                             <div className="flex flex-col mt-0.5">
                                <span className={\`font-bold \${creatorMode === 'documentary' ? 'text-white' : 'text-white/70'}\`}>الأبعاد الوثائقية</span>
                                <span className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">سرد بحثي مكثف. غوص في الأرشيف ومصادر موثقة لإنشاء عمق معلوماتي.</span>
                             </div>
                             {creatorMode === 'documentary' && <div className="mr-auto w-2 h-2 rounded-full bg-[#4f46e5] shadow-[0_0_8px_rgba(79,70,229,0.8)] self-center" />}
                           </button>

                           <button
                             onClick={() => { setCreatorMode("reels"); setIsLongForm(false); setDuration(1); playClick(); }}
                             className={\`flex items-start gap-4 p-5 rounded-2xl border transition-all text-right \${creatorMode === 'reels' ? 'bg-[#4f46e5]/5 border-[#4f46e5]/40 shadow-[inner_0_0_20px_rgba(79,70,229,0.1)]' : 'bg-transparent border-white/5 hover:border-white/20 hover:bg-white/5'}\`}
                           >
                             <div className={\`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border \${creatorMode === 'reels' ? 'bg-[#4f46e5]/20 border-[#4f46e5]/40 text-[#4f46e5]' : 'bg-white/5 border-white/10 text-white/40'}\`}>
                                <Smartphone size={24} strokeWidth={1.5} />
                             </div>
                             <div className="flex flex-col mt-0.5">
                                <span className={\`font-bold \${creatorMode === 'reels' ? 'text-white' : 'text-white/70'}\`}>الريلز والشورتس</span>
                                <span className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">محتوى يخطف العين. إيقاع سريع، تأثيرات بصرية قوية ومعلومة تكسر مسار التمرير.</span>
                             </div>
                             {creatorMode === 'reels' && <div className="mr-auto w-2 h-2 rounded-full bg-[#4f46e5] shadow-[0_0_8px_rgba(79,70,229,0.8)] self-center" />}
                           </button>
                        </div>
                    </div>

                    <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.04] rounded-3xl p-6 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                           <Settings2 className="w-5 h-5 text-white/40" />
                           <h3 className="text-white text-lg font-bold tracking-wide">التحكم التقني <span className="text-white/30 font-sans tracking-widest text-[10px] uppercase ml-2 block">Settings</span></h3>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl resize-none bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/80">Ollama (محلي)</span>
                              <span className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">LOCAL PROCESSING</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={useOllama} onChange={(e) => setUseOllama(e.target.checked)} />
                             <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                           </label>
                        </div>
                        
                        {useOllama && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs text-white/50 px-1">المودل المستخدم:</span>
                                <input
                                  type="text"
                                  className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#4f46e5]/50 focus:outline-none font-mono transition-colors"
                                  value={ollamaModel}
                                  onChange={(e) => setOllamaModel(e.target.value)}
                                  placeholder="مثال: llama3.1"
                                />
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between p-4 rounded-xl resize-none bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/80">وضع التركيز (Zen Mode)</span>
                              <span className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">DISTRACTION FREE</span>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" />
                             <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                           </label>
                        </div>
                    </div>
                </div>
             </motion.div>
          )}

`;

fs.writeFileSync('src/pages/ContentCreationPage.tsx', top + replacement + bottom);
console.log("Rewrote step 1 successfully.");
