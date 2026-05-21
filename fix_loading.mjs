import fs from 'fs';

let text = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const startStr = "{isLoading && (";

// We know the element ends right before `<AnimatePresence mode="wait">` for `{!data && !researchMap && suggestedTitles.length > 0 && (` or `<div className="pb-24 pt-6">`. Let's find the first `</AnimatePresence>` ? Usually we can just slice string.
const startIdx = text.indexOf('{isLoading && (');
const nextAnimatePresence = text.indexOf('<AnimatePresence mode="wait">', startIdx + 10);
if (startIdx !== -1 && nextAnimatePresence !== -1) {
    const replacement = `{isLoading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-4xl bg-black border border-white/20 rounded-md relative overflow-hidden flex flex-col h-[80vh] md:h-[60vh] shadow-2xl"
              style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L40 40 L40 0' fill='none' stroke='white' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")\` }}
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent-danger/80"></span>
                  <span className="w-3 h-3 rounded-full bg-accent-warning/80"></span>
                  <span className="w-3 h-3 rounded-full bg-white/20"></span>
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-white/50 tracking-widest uppercase">
                  SYSTEM_TERMINAL // PIPELINE_EXECUTION
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden">
                {error ? (
                  <div className="z-20 flex flex-col items-center justify-center text-center w-full h-full">
                    <AlertTriangle className="w-16 h-16 text-accent-danger mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-accent-danger mb-4 font-mono tracking-tight uppercase">
                      [ERROR] PIPELINE_FAILED
                    </h3>
                    <div className="text-white w-full text-left max-w-lg font-mono text-sm border border-accent-danger/30 p-4 bg-accent-danger/5 leading-relaxed overflow-y-auto max-h-[40vh]">
                      <p className="font-bold text-accent-danger mb-2 opacity-90">&gt; ERROR_SIG:</p>
                      <p className="mb-4 break-words" dir="auto">{error}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsLoading(false);
                        setError("");
                      }}
                      className="mt-6 px-8 py-3 bg-white/5 active:bg-accent-danger/20 active:border-accent-danger text-white border border-white/20 font-mono transition-all uppercase text-sm"
                    >
                      &gt; ABORT_AND_RETRY
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full h-full justify-between gap-4">
                    {/* Status Header */}
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4 shrink-0">
                      <div className="w-12 h-12 border border-accent-danger flex items-center justify-center bg-accent-danger/10">
                        <Terminal className="w-6 h-6 text-accent-danger animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-mono tracking-widest text-accent-danger uppercase">
                          STATUS: ACTIVE
                        </h4>
                        <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1" dir="rtl">
                           {status}
                        </div>
                      </div>
                    </div>

                    {/* Console Output */}
                    <div className="flex-1 bg-black border border-white/10 font-mono text-xs sm:text-sm text-green-400 p-4 overflow-hidden relative flex flex-col justify-end w-full">
                       <div className="absolute top-0 right-0 bg-white/10 px-2 py-1 text-[10px] text-white/50 tracking-widest">LIVE_STREAM</div>
                       <div className="w-full text-right overflow-y-auto whitespace-pre-wrap leading-relaxed opacity-80" dir="rtl" style={{ wordBreak: 'break-word', scrollBehavior: 'smooth' }}>
                         {streamedChunk ? (
                           streamedChunk.length > 800 ? "..." + streamedChunk.slice(-800).replace(/["\\{\\}\\[\\]]/g, "").replace(/([a-zA-Z0-9_]+):/g, "\\n[SYS] ") : streamedChunk.replace(/["\\{\\}\\[\\]]/g, "").replace(/([a-zA-Z0-9_]+):/g, "\\n[SYS] ")
                         ) : (
                           "[WAITING FOR DATA...]"
                         )}
                         <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1 align-middle" />
                       </div>
                    </div>

                    {/* Progress Footer */}
                    <div className="w-full space-y-2 pt-2 shrink-0">
                      <div className="flex justify-between text-[10px] sm:text-xs font-bold font-mono text-white/70">
                        <span>[ {Math.round(progress)}% ]</span>
                        <span>ETA: {estimatedTime > 0 ? \`\${estimatedTime}s\` : "CALCULATING..."}</span>
                      </div>
                      <div className="w-full h-2 sm:h-3 bg-white/5 border border-white/20 overflow-hidden">
                        <motion.div
                          className="h-full bg-accent-danger"
                          initial={{ width: 0 }}
                          animate={{ width: \`\${progress}%\` }}
                          transition={{ ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
        
        `;
    // We need to cut exactly until the AnimatePresence starting line. 
    // It's safer to just count brackets if we can.
    
    let endIdx = -1;
    let bracketCount = 0;
    for (let i = startIdx + 11; i < text.length; i++) {
        if (text[i] === '{') bracketCount++;
        if (text[i] === '}') bracketCount--;
        
        if (bracketCount === -1 && text.slice(i, i+10).includes('}')) {
             // ensure it's closing the main {isLoading}
             if (text.substring(i, i + 100).includes('<AnimatePresence')) {
                 endIdx = i + 1;
                 break;
             }
        }
    }
    
    if (endIdx !== -1) {
        text = text.substring(0, startIdx) + replacement + text.substring(endIdx);
        fs.writeFileSync('src/pages/ContentCreationPage.tsx', text);
        console.log('REPLACEMENT SUCCESS2');
    } else {
        console.log('BRACKET FAILED');
    }
}
