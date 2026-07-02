const fs = require('fs');
let code = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const target = `                          <div className="absolute bottom-6 left-6">
                            <button
                               onClick={() => {
                                 if (!creatorMode) {
                                     alert("الرجاء اختيار القالب الإنتاجي أولاً من القائمة الجانبية.");
                                     return;
                                 }
                                 handleSpinRadar();
                               }}
                               disabled={!topic.trim() || isGeneratingTitle}
                               className="px-8 py-3 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white rounded-xl font-bold font-arabic shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                             >
                               {isGeneratingTitle ? (
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
                    </div>`;

const replacement = `                          <div className="absolute bottom-6 left-6 flex items-center gap-3">
                            <button
                               onClick={handleGenerateDiverseTopics}
                               disabled={isGeneratingTopics}
                               className="px-5 py-3 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-xl font-bold font-arabic transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                               title="اقتراح أفكار متنوعة وتريندنج"
                             >
                               {isGeneratingTopics ? <Loader2 className="w-4 h-4 animate-spin text-[#4f46e5]" /> : <Radar className="w-4 h-4 text-[#4f46e5]" />}
                               <span className="text-sm">اقتراح أفكار</span>
                            </button>
                            <button
                               onClick={() => {
                                 if (!creatorMode) {
                                     alert("الرجاء اختيار القالب الإنتاجي أولاً من القائمة الجانبية.");
                                     return;
                                 }
                                 handleSpinRadar();
                               }}
                               disabled={!topic.trim() || isGeneratingTitle}
                               className="px-8 py-3 bg-gradient-to-r from-[#4f46e5] to-[#3b82f6] text-white rounded-xl font-bold font-arabic shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0"
                             >
                               {isGeneratingTitle ? (
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
                    
                    {/* Diverse Topics Selector */}
                    <AnimatePresence>
                      {diverseTopics.length > 0 && (
                          <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 flex flex-col gap-4"
                          >
                             <div className="flex items-center gap-2 px-2 text-[#4f46e5] text-sm font-bold">
                               <Radar className="w-4 h-4" />
                               <span>أفكار مقترحة (اضغط على الفكرة لاختيارها):</span>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               {diverseTopics.map((t, i) => (
                                 <button
                                   key={i}
                                   onClick={() => {
                                     setTopic(t.title + "\\n\\nالمحور: " + t.description);
                                     setDiverseTopics([]);
                                   }}
                                   className="text-right p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-[#4f46e5]/40 hover:bg-[#4f46e5]/5 transition-all group flex flex-col gap-2 w-full active:scale-[0.98]"
                                 >
                                    <h5 className="text-[15px] font-arabic font-bold text-white leading-tight">{t.title}</h5>
                                    <p className="text-xs font-arabic text-[#a1a1aa] leading-relaxed line-clamp-2">{t.description}</p>
                                 </button>
                               ))}
                             </div>
                          </motion.div>
                      )}
                    </AnimatePresence>`;

if(code.includes(target)) {
   code = code.replace(target, replacement);
   fs.writeFileSync('src/pages/ContentCreationPage.tsx', code);
   console.log("Updated UI");
} else {
   console.log("Target not found!");
}
