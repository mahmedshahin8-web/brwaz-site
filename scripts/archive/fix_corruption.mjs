import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const strStart = `        ) : researchMap ? (
          /* RESEARCH MAP VIEW */`;

const strEnd = `        ) : (
          /* SEARCH / RADAR VIEW */`;

const correctChunk = `        ) : researchMap ? (
          /* RESEARCH MAP VIEW */
          <div className="p-8 lg:p-32 space-y-40">
             <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/5 pb-16">
                <div className="text-right space-y-4">
                   <div className="flex items-center justify-end gap-4">
                      <div className="w-2 h-2 rounded-sm bg-[#f0c722] shadow-[0_0_15px_rgba(240,199,34,0.4)]" />
                      <span className="text-[11px] font-mono text-[#f0c722] tracking-[0.5em] font-bold uppercase underline decoration-[#f0c722]/20 underline-offset-8">تحميل_الخريطة_البحثية_نشط</span>
                   </div>
                   <h2 className="text-7xl font-arabic font-black text-white tracking-tighter leading-none font-arabic uppercase opacity-90">{researchMap.video_title}</h2>
                </div>
                <button 
                  onClick={handleApproveResearchMap}
                  className="px-24 py-7 bg-[#f0c722] text-black font-mono font-black text-sm tracking-[0.5em] uppercase transition-none shadow-[0_30px_60px_rgba(212,175,55,0.1)] group relative overflow-hidden rounded-sm"
                >
                  <Zap className="w-5 h-5 inline-block mr-3 fill-current" /> 
                  اعتماد_وبدء_التصنيع
                </button>
             </header>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
                <div className="lg:col-span-2 space-y-32">
                   <div className="p-12 premium-card space-y-10 relative overflow-hidden bg-[#050505]/60 border border-white/5 backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-2 h-full bg-[#f0c722]/10" />
                      <h3 className="text-[11px] font-mono font-bold text-white/20 uppercase tracking-[0.4em] text-right">الفرضية_المركزية // HYPOTHESIS</h3>
                      <p className="text-3xl font-arabic text-white/90 leading-relaxed text-right font-medium">"{researchMap.central_hypothesis}"</p>
                   </div>

                   <div className="space-y-12">
                      <h3 className="text-[11px] font-mono font-bold text-white/20 uppercase tracking-[0.4em] text-right">محاور_التحقيق // CHAPTERS</h3>
                      <div className="grid grid-cols-1 gap-6">
                         {researchMap.chapters.map((ch, i) => (
                            <div key={i} className="p-10 bg-[#050505]/60 border border-white/5 flex items-center justify-between group transition-none relative">
                               <div className="absolute left-0 top-0 h-full w-1 bg-[#f0c722]/0 group-hover:bg-[#f0c722]/20 transition-all" />
                               <span className="text-micro font-mono text-white/10 group-hover:text-[#f0c722] transition-colors">CHAPTER_0{i+1}</span>
                               <div className="text-right">
                                  <h4 className="text-2xl font-arabic font-black text-white mb-4">{ch.chapter_title}</h4>
                                  <p className="text-sm font-arabic text-white/40 leading-relaxed max-w-2xl ml-auto">{ch.chapter_summary}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <aside className="space-y-20">
                   <div className="space-y-10">
                      <h3 className="text-micro font-mono font-bold text-white/10 uppercase tracking-[0.3em] text-right">الترابط_المعلوماتي // GRAPH</h3>
                      <IntelGraph research={researchMap} />
                   </div>

                   <div className="p-10 bg-[#050505]/60 backdrop-blur-xl border border-white/5 space-y-10 relative overflow-hidden rounded-sm">
                      <div className="absolute top-0 right-0 w-full h-1 bg-white/5" />
                      <h3 className="text-micro font-mono font-bold text-white/10 uppercase tracking-[0.3em] text-right">الأدلة_المرجعية // SOURCES</h3>
                      <div className="space-y-4">
                         {researchMap?.sources?.slice(0, 10).map((s, i) => (
                            <div key={i} className="text-micro font-mono text-white/30 flex items-center gap-4 justify-end  transition-none">
                               <span className="truncate">{s.title}</span>
                               <div className="w-1 h-1 rounded-sm bg-[#f0c722]/20" />
                            </div>
                         ))}
                         {researchMap.sources.length > 10 && (
                            <div className="text-[9px] font-mono text-white/10 text-right">+[ {researchMap.sources.length - 10} ] مصادر أخرى مكتشفة...</div>
                         )}
                      </div>
                   </div>
                </aside>
             </div>
          </div>
        ) : (
          /* SEARCH / RADAR VIEW */`;

let indexOfBrokenStart = content.indexOf(') : researchMap ? (');
let indexOfSearchRadar = content.indexOf('          /* SEARCH / RADAR VIEW */', indexOfBrokenStart + 1);

if (indexOfBrokenStart !== -1 && indexOfSearchRadar !== -1) {
  content = content.substring(0, indexOfBrokenStart) + correctChunk + content.substring(indexOfSearchRadar + 35);
}

// Eliminate double suggestedTitles chunks which broke parsing
// Easiest is to manually cut out the erroneous segment
// Let's find: `                   {suggestedTitles.length > 0 && !data && (` and delete from first one to second one!
const marker = '{suggestedTitles.length > 0 && !data && (';
let firstMarker = content.indexOf(marker);
let secondMarker = content.indexOf(marker, firstMarker + 1);
let thirdMarker = content.indexOf(marker, secondMarker + 1);

if (secondMarker !== -1 && thirdMarker !== -1) {
   // delete between second and third!
   content = content.substring(0, secondMarker) + content.substring(thirdMarker);
} else if (secondMarker !== -1) {
   // There's two markers. Let's see if there's a stray `}` or `</main>` in between.
   // Wait, let's just use regex to remove any extra unclosed blocks.
   content = content.replace(/\{suggestedTitles\.length > 0 && !data && \(\s*<section className="space-y-8 mt-8">\s*\{suggestedTitles\.length > 0 && !data && \(/g, '{suggestedTitles.length > 0 && !data && (');
   content = content.replace(/\)\}\s*\}\)\s*<\/main>\s*\{suggestedTitles/g, ')}\n                       </main>\n\n                   {suggestedTitles');
   content = content.replace(/<\/\s*main>\s*\{suggestedTitles\.length > 0 && !data && \(/g, '\n                   {suggestedTitles.length > 0 && !data && (');
}

// Ensure the tag structure is right for the radar section
content = content.replace(/\{\s*suggestedTitles\.length > 0 && !data && \(\s*<section className="space-y-8 mt-8">\s*\{/g, '{suggestedTitles.length > 0 && !data && (\n<section className="space-y-8 mt-8">\n');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log("Fixed JSX corruption");
