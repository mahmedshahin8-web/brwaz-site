const fs = require('fs');
const content = `import React, { useState, useEffect, useRef } from 'react';
import { Film, Bold, Italic, List, Type, Save, Play, Plus, Trash2, Copy, MonitorPlay, Clock, Maximize, Columns, Mic, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scene {
  id: string;
  text: string;
  duration: number;
}

export const ScriptEditor: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem('barwaz_script_data');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTeleprompterMode, setIsTeleprompterMode] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2); // 1 to 5
  const teleprompterRef = useRef<HTMLDivElement>(null);

  // Save to local storage whenever scenes change
  useEffect(() => {
    localStorage.setItem('barwaz_script_data', JSON.stringify(scenes));
  }, [scenes]);

  // Teleprompter Auto-scroll logic
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollStep = (currentTime: number) => {
      if (isTeleprompterMode && teleprompterRef.current) {
        const deltaTime = currentTime - lastTime;
        if (deltaTime > 16) {
           teleprompterRef.current.scrollTop += (teleprompterSpeed * 0.5);
           lastTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    if (isTeleprompterMode) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTeleprompterMode, teleprompterSpeed]);

  const addScene = () => {
    setScenes([...scenes, { id: \`scene-\${Date.now()}\`, text: '', duration: 5 }]);
  };

  const removeScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const duplicateScene = (id: string) => {
    const sceneToCopy = scenes.find(s => s.id === id);
    if (sceneToCopy) {
      setScenes([...scenes, { ...sceneToCopy, id: \`scene-\${Date.now()}\` }]);
    }
  };

  const updateSceneText = (id: string, text: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, text } : s));
  };

  const getWordCount = () => {
    const fullText = scenes.map(s => s.text).join(' ');
    // Basic word count (split by spaces)
    const words = fullText.trim().split(/\\s+/).filter(w => w.length > 0);
    return words.length;
  };

  const getEstimatedTime = () => {
    const words = getWordCount();
    const minutes = Math.ceil(words / 130);
    return minutes;
  };

  const handleExportTTS = () => {
    const fullText = scenes.map(s => s.text).join(' \\n\\n ');
    // Basic TTS clean-up algorithm
    let ttsText = fullText
      .replace(/&/g, ' و ')
      .replace(/%/g, ' بالمائة ')
      .replace(/1/g, 'واحد')
      .replace(/2/g, 'اثنين')
      .replace(/3/g, 'ثلاثة')
      // This is a dummy phonetic replacement just to show the feature logic
      .replace(/\\s+/g, ' ');

    const blob = new Blob([ttsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Barwaz_TTS_Prep.txt';
    link.click();
  };

  if (isTeleprompterMode) {
    return (
      <div className="fixed inset-0 bg-black text-white z-[9999] flex flex-col font-['JetBrains_Mono'] " dir="rtl">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-50">
           <div className="flex items-center gap-4">
              <span className="text-xl text-accent-danger font-bold uppercase tracking-widest">وضع الملقن (Teleprompter)</span>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
                 <span className="text-xs text-text-muted uppercase">سرعة التمرير:</span>
                 <input type="range" min="1" max="5" value={teleprompterSpeed} onChange={e => setTeleprompterSpeed(Number(e.target.value))} className="w-24 accent-accent-danger" />
              </div>
           </div>
           <button onClick={() => setIsTeleprompterMode(false)} className="px-4 py-2 bg-white/10 active:bg-white/20 border border-white/20 transition-colors uppercase text-sm font-bold">
             إغلاق
           </button>
        </div>
        <div 
          ref={teleprompterRef}
          className="flex-1 overflow-y-auto pt-32 pb-64 px-10 md:px-32 lg:px-64 scroll-smooth hide-scrollbar"
        >
           <div className="max-w-4xl mx-auto space-y-12">
             {scenes.map((scene, i) => (
                <div key={scene.id} className="text-5xl leading-[1.8] font-bold text-center text-white/90">
                   {scene.text}
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={\`min-h-screen bg-bg-dark text-text-primary \${isFocusMode ? 'p-0' : 'p-6'}\`} dir="rtl">
      
      {/* Header - Hides in Focus Mode */}
      {!isFocusMode && (
         <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
           <div>
             <h1 className="text-2xl font-bold flex items-center gap-2">
               <span className="text-accent-danger"><MonitorPlay className="w-6 h-6" /></span>
               محرر سكريبتات التحقيق (Script Editor)
             </h1>
             <p className="text-text-secondary text-sm mt-1 tracking-wider font-['JetBrains_Mono']">
               RESTRICTED ACCESS // LEVEL 4 CLEARANCE
             </p>
           </div>
           
           <div className="flex gap-3">
             <button onClick={() => setIsSplitScreen(!isSplitScreen)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none active:bg-white/10 transition-colors text-sm">
               <Columns className="w-4 h-4 text-cyan-400" />
               شاشة منقسمة
             </button>
             <button onClick={() => setIsFocusMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none active:bg-white/10 transition-colors text-sm">
               <Maximize className="w-4 h-4 text-accent-danger" />
               وضع التركيز
             </button>
             <button onClick={() => setIsTeleprompterMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none active:bg-white/10 transition-colors text-sm">
               <Mic className="w-4 h-4 text-accent-warning" />
               وضع الملقن
             </button>
           </div>
         </header>
      )}

      {/* Main Layout */}
      <div className={\`mx-auto flex gap-6 transition-all duration-300 \${isSplitScreen && !isFocusMode ? 'max-w-[95%] items-start' : 'max-w-4xl'}\`}>
         
         {/* Editor Main Column */}
         <div className={\`flex-1 space-y-6 \${isFocusMode ? 'mt-12 max-w-3xl mx-auto' : ''}\`}>
            
            {/* Context/Stats Bar */}
            <div className="flex justify-between items-center bg-black/40 border border-white/10 p-3 rounded-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-1 h-full bg-accent-danger" />
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-text-muted uppercase font-['JetBrains_Mono'] tracking-widest">زمن الحلقة المتوقع</span>
                     <span className="font-bold text-accent-warning text-lg flex items-center gap-1"><Clock className="w-4 h-4"/> {getEstimatedTime()} دقائق</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-text-muted uppercase font-['JetBrains_Mono'] tracking-widest">عدد الكلمات</span>
                     <span className="font-bold text-white text-lg">{getWordCount()} كلمة</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  {isFocusMode && (
                     <button onClick={() => setIsFocusMode(false)} className="px-4 py-2 bg-white/10 text-white border border-white/20 active:bg-white/20 transition-colors text-xs uppercase font-['JetBrains_Mono'] mr-4">
                        الخروج من التركيز
                     </button>
                  )}
                  <button onClick={handleExportTTS} className="flex items-center gap-2 px-4 py-2 bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 rounded-none active:bg-cyan-900/60 transition-colors text-xs uppercase font-bold">
                     <Download className="w-3 h-3" />
                     تجهيز النطق (TTS)
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 bg-accent-danger/20 border border-accent-danger/30 text-accent-danger rounded-none active:bg-accent-danger active:text-white transition-colors text-sm font-bold shadow-danger">
                     <Save className="w-4 h-4" />
                     حفظ السكريبت
                  </button>
               </div>
            </div>

            {/* Script Area */}
            <div className="space-y-4">
               <AnimatePresence>
                 {scenes.map((scene, index) => (
                   <motion.div 
                     key={scene.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-black/60 p-0 rounded-none border border-white/10 group relative active:border-white/20 transition-all focus-within:border-accent-danger/50"
                   >
                     {/* Horizontal indicator line instead of shadow */}
                     <div className="h-1 w-full bg-white/5 flex transition-colors group-focus-within:bg-accent-danger" />

                     <div className="p-4">
                        {/* Scene Meta */}
                        <div className="flex justify-between items-center mb-0">
                          <div className="flex items-center gap-3">
                            <span className="text-accent-danger font-['JetBrains_Mono'] font-bold text-xs bg-accent-danger/10 px-2 py-1 border border-accent-danger/30">
                              SEQ_{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 opacity-50 active:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button onClick={() => duplicateScene(scene.id)} className="p-1.5 active:bg-white/10 border border-transparent active:border-white/20 text-white transition-colors" title="تكرار">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeScene(scene.id)} className="p-1.5 active:bg-accent-danger/20 border border-transparent active:border-accent-danger/30 text-accent-danger transition-colors" title="حذف">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Text Area */}
                        <textarea 
                          value={scene.text}
                          onChange={(e) => updateSceneText(scene.id, e.target.value)}
                          className="w-full mt-3 bg-transparent border-none outline-none resize-none text-white/90 placeholder:text-white/20 leading-[1.8] font-bold min-h-[100px]"
                          placeholder="[ أدخل النص المكتوب هنا... ]"
                          dir="rtl"
                        />
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>

               {/* Add Scene Button */}
               <button 
                 onClick={addScene}
                 className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 active:bg-white/10 text-text-muted transition-colors uppercase font-mono tracking-widest text-sm"
               >
                 <Plus className="w-4 h-4" />
                 إضافة تسلسل جديد (ADD SEQUENCE)
               </button>
            </div>
         </div>

         {/* Side Panel Wrapper for Split Screen */}
         {isSplitScreen && !isFocusMode && (
            <div className="w-[350px] shrink-0 border border-white/10 bg-black/40 p-4 sticky top-6 space-y-4">
               <h3 className="font-['JetBrains_Mono'] text-accent-danger font-bold text-sm tracking-widest border-b border-white/10 pb-2 uppercase">
                 [ مسودة البحث والمصادر ]
               </h3>
               <p className="text-sm text-text-muted leading-relaxed">
                 يمكنك استعراض المصادر أو المعلومات التي تم تجميعها من صفحة الرادار هنا لسهولة السحب والإفلات وتنسيق الحلقة دون مغادرة المحرر.
               </p>
               {/* Dummy research blocks */}
               <div className="p-3 border border-white/5 bg-white/5 active:border-white/20 transition-colors text-xs text-white/70 leading-relaxed">
                  <strong>معلومة:</strong> بلغ عدد المشاركين في الحدث الأخير 40,000 شخص وفقاً للتقارير الرسمية.
               </div>
               <div className="p-3 border border-white/5 bg-white/5 active:border-white/20 transition-colors text-xs text-white/70 leading-relaxed">
                  <strong>اقتباس:</strong> "الخوارزميات هي المحرك الخفي للاقتصاد الجديد." - رئيس الشركة.
               </div>
               <div className="p-3 border border-white/5 bg-white/5 active:border-white/20 transition-colors text-xs text-white/70 leading-relaxed">
                  <strong>مصدر:</strong> تقرير وكالة رويترز بتاريخ أمس.
               </div>
            </div>
         )}
         
      </div>

      <style dangerouslySetInnerHTML={{__html: \`
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
      \`}} />
    </div>
  );
};
`;
fs.writeFileSync('src/pages/ScriptEditor.tsx', content);
console.log('updated ScriptEditor with layout');
