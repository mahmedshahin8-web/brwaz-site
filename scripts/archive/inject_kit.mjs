import fs from 'fs';

let text = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const injection = `
      {/* 🚀 YouTube Publishing Kit UI 🚀 */}
      {data && data.publishing_kit && typeof data.publishing_kit === 'object' && (
        <div className="max-w-4xl mx-auto mt-12 bg-black border border-white/20 p-8 relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)]" dir="rtl">
           <div className="absolute top-0 right-0 w-2 h-full bg-accent-danger/80"></div>
           <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 20 L20 0' fill='none' stroke='white' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")\` }}></div>
           
           <h2 className="text-3xl font-bold font-serif mb-6 text-white border-b border-white/10 pb-4 relative flex items-center justify-between">
              <div>📦 باقة النشر على يوتيوب (Publishing Kit)</div>
              <div className="text-xs font-mono tracking-widest text-accent-danger uppercase">System_SEO_Agent</div>
           </h2>

           <div className="space-y-8 relative z-10">
              {/* Titles Section */}
              <section>
                 <h3 className="text-accent-danger font-mono font-bold uppercase mb-4 tracking-widest text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4"/> [A/B] Titles (No Cliches)
                 </h3>
                 <div className="flex flex-col gap-3">
                    {data.publishing_kit.youtube_titles?.map((title: string, i: number) => (
                       <button key={i} className="text-right p-4 bg-white/5 active:bg-accent-danger/20 border border-white/10 active:border-accent-danger transition-colors font-bold text-lg cursor-pointer flex justify-between items-center group">
                          <span>{title}</span>
                          <span className="opacity-0 group-active:opacity-100 text-xs font-mono text-accent-danger tracking-widest transition-opacity uppercase">Tap to Copy</span>
                       </button>
                    ))}
                 </div>
              </section>

              {/* Description Section */}
              <section>
                 <h3 className="text-accent-danger font-mono font-bold uppercase mb-4 tracking-widest text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4"/> Description & Sources (Injected)
                 </h3>
                 <div className="p-4 bg-white/5 border border-white/10 font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar text-right">
                    {data.publishing_kit.description}
                 </div>
              </section>

              {/* Chapters & Tags */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-accent-warning font-mono font-bold uppercase mb-4 tracking-widest text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4"/> Timestamps
                   </h3>
                   <div className="flex flex-col gap-2">
                      {data.publishing_kit.chapters?.map((ch: any, i: number) => (
                         <div key={i} className="flex gap-4 p-2 bg-black border border-white/10 text-sm active:border-accent-warning transition-colors cursor-pointer">
                            <span className="text-accent-warning font-mono pl-4 border-l border-white/10 text-left w-16">{ch.timestamp}</span>
                            <span className="text-white/80">{ch.title}</span>
                         </div>
                      ))}
                   </div>
                 </div>

                 {/* Tags Panel */}
                 <div>
                   <h3 className="text-cyan-400 font-mono font-bold uppercase mb-4 tracking-widest text-sm flex items-center gap-2">
                      <Database className="w-4 h-4"/> SEO Tags
                   </h3>
                   <div className="flex flex-wrap gap-2">
                      {data.publishing_kit.tags?.map((tag: string, i: number) => (
                         <span key={i} className="px-3 py-1 bg-cyan-900/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono active:bg-cyan-500/50 transition-colors">
                            #{tag.replace(/\\s+/g, "_")}
                         </span>
                      ))}
                   </div>
                 </div>
              </section>

              {/* Thumbnail Section */}
              <section>
                 <h3 className="text-purple-400 font-mono font-bold uppercase mb-4 tracking-widest text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4"/> Thumbnail Prompt (Midjourney)
                 </h3>
                 <div className="w-full relative">
                    <textarea 
                       readOnly
                       rows={3}
                       dir="ltr"
                       className="w-full p-4 bg-purple-900/10 border border-purple-500/30 text-purple-200 font-mono text-sm leading-relaxed resize-none focus:outline-none active:border-purple-500 transition-colors"
                       value={data.publishing_kit.thumbnail_prompt}
                    />
                 </div>
              </section>
              
              {/* Action Buttons */}
              <div className="border-t border-white/10 pt-6 mt-6 flex justify-end gap-4">
                 <button className="px-6 py-2 bg-white/5 active:bg-white/10 border border-white/20 text-white font-mono text-sm uppercase transition-colors">
                    &lt; Export Kit as ZIP
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Timeline Editor */}
      {data && (
         <div className="max-w-4xl mx-auto mt-6 mb-20 relative z-20">
           <TimelineEditor data={data} activeTab={activeTab} onTabChange={setActiveTab} />
         </div>
      )}
`;

const insertPos = text.indexOf('{/* End main container */}');
if (insertPos !== -1) {
    text = text.substring(0, insertPos) + injection + '\\n' + text.substring(insertPos);
    fs.writeFileSync('src/pages/ContentCreationPage.tsx', text);
    console.log("TimelineEditor & Kit rendered back safely!");
} else {
    console.log("Could not find insertPos");
}
