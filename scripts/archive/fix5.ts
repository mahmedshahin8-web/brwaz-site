import fs from 'fs';
const text = fs.readFileSync('src/App.tsx', 'utf-8');

// I need to replace from `ال ...` up to `... ابدأ الآن بكتابة الـ Hook والفصل الأول!`;one` with what it originally was! 
// Wait, I can just replace lines 706 to 738 with the correct `resetBoard` and `return (` code.

const lines = text.split('\n');
const fixedCode = `            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-[#8b0000] newspaper leading-none" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>الرادار</h1>
            <p className="mt-4 text-xl md:text-3xl text-[#1a1a1a] max-w-2xl mx-auto tracking-wide leading-relaxed font-bold relative z-10 bg-[#f4eee0] px-4 py-1 inline-block border-y-2 border-[#1a1a1a]">
              غرفة عمليات صناعة المحتوى
            </p>
          </div>
          
          <div className="flex justify-center w-full">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={\`relative mt-16 sm:mt-24 z-30 w-[90%] sm:w-[400px] h-auto bg-white border-2 border-[#1a1a1a] p-6 shadow-[4px_4px_0_#1a1a1a]\`}
            >
               <h3 className="text-[#8b0000] font-bold mb-4 newspaper text-2xl text-center border-b-2 border-[#1a1a1a] pb-2">خبر عاجل: موضوع الحلقة</h3>
               <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="اكتب هنا الخبر أو تفاصيل الحلقة..."
                  className="w-full h-32 bg-transparent border-none resize-none focus:ring-0 text-[#1a1a1a] font-bold text-base placeholder-[#1a1a1a]/40 p-0 font-arabic-body"
               />`;

lines.splice(705, 34, ...fixedCode.split('\n')); 
// Wait, 705 is line 706 right? Let's verify line text.
// Line 705 (index 704):           <div className="text-center cursor-pointer" onClick={resetBoard}>
// Line 706 (index 705):             <h1 className="text-6xl ...

fs.writeFileSync('src/App.tsx', lines.join('\n'));
