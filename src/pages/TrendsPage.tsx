import { apiFetch } from "../lib/apiFetch";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, Search, Activity, GitCommit, Database, Radio } from "lucide-react";

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState("map");
  const [pulses, setPulses] = useState<any[]>([]);
  const [matrixText, setMatrixText] = useState<string[]>([]);

  // Integration with AI for real coordinates & sentiment
  useEffect(() => {
    let active = true;
    const fetchRealTrends = async () => {
      try {
        setMatrixText(["[بحث] جاري انتظار الإشارة من المصادر العامة..."]);
        const res = await apiFetch('/api/trends/public');
        if(res.ok && active) {
          const data = await res.json();
          if(data.success && data.items && data.items.length > 0) {
              setMatrixText(prev => ["[معالجة] جاري تحليل الأخبار والمشاعر...", ...prev].slice(0, 15));
              
              // Use the configured AI to analyze the RSS headlines
              const { generateAIContentRaw, Type } = await import("../lib/gemini");
              
              const prompt = `Analyze these global news headlines and assign an approximate map coordinate (x: 10-90, y: 10-90, where 50,50 is the center of the world map).
Also assign a sentiment: [SENTIMENT: CRITICAL], [SENTIMENT: ALERT], or [SENTIMENT: WATCHING].
Headlines:
${data.items.map((i: any) => "- " + i.title).join('\n')}

Output JSON array of objects.`;

              const aiResult = await generateAIContentRaw(prompt, {
                 type: Type.ARRAY,
                 items: {
                   type: Type.OBJECT,
                   properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      isHighPriority: { type: Type.BOOLEAN },
                      sentiment: { type: Type.STRING },
                      headline: { type: Type.STRING }
                   },
                   required: ["x", "y", "isHighPriority", "sentiment", "headline"]
                 }
              });

              if (!active) return;

              let parsed = [];
              try { parsed = JSON.parse(aiResult); } catch(e) {}
              
              if (Array.isArray(parsed) && parsed.length > 0) {
                 // Sequentially trigger pulses and feed text
                 parsed.forEach((item: any, i: number) => {
                    setTimeout(() => {
                        if (!active) return;
                        setPulses(prev => [...prev.slice(-4), { id: Date.now(), x: item.x || Math.random()*80+10, y: item.y || Math.random()*80+10, isHighPriority: !!item.isHighPriority }]);
                        setMatrixText(prev => [`${item.sentiment} ${item.headline}`, ...prev].slice(0, 15));
                    }, i * 3000); // 3 seconds between each pulse display
                 });
                 return;
              }
          }
        }
      } catch(e) {
        console.error("Trends analysis failed", e);
      }
      
      // Fallback
      if (active) {
         setMatrixText(prev => ["[استماع] جاري قراءة البيانات الخارجية...", ...prev].slice(0, 15));
      }
    };

    fetchRealTrends();

    return () => { active = false; };
  }, []);

  const tabs = [
    { id: "map", label: "الخريطة الحرارية ", icon: Flame },
    { id: "keywords", label: "الكلمات النشطة", icon: Activity },
  ];

  return (
    <div className="min-h-full font-arabic text-[#fafafa] space-y-6" dir="rtl">
      {/* Header */}
      <header className="bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        <div>
          <h2 className="text-3xl font-black text-[#fafafa] font-arabic mb-2 tracking-wide flex items-center gap-3">
             <Radio className="w-8 h-8 text-[#4f46e5] animate-pulse" />
             الرادار والأحداث
          </h2>
          <p className="text-[#a1a1aa] font-arabic text-xs leading-relaxed max-w-2xl mt-2  ">
            مسح الترددات النشطة في الشبكة العالمية. التقاط النبضات وإشارات الاستخبارات.
          </p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Heatmap Area (Spans 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
               
               {/* Map Container */}
               <div className="bg-[#121214]  rounded-xl border border-[#27272a] p-6 shadow-sm relative overflow-hidden flex flex-col">
                  
                  {/* Controls Header inside Map Card */}
                  <div className="flex justify-between items-center mb-6 z-10">
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] font-arabic text-[9px]   rounded-lg">
                            <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-pulse" /> حرج_جدًا
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-arabic text-[9px]   rounded-lg">
                            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full" /> رصد_عادي
                        </div>
                    </div>
                    <div className="text-[10px] font-arabic text-[#a1a1aa]   flex items-center gap-2">
                        <Activity size={12} className="text-[#4f46e5]" />
                        معدل المزامنة: 2000ms
                    </div>
                  </div>

                  {/* The Map (Simulated via Canvas/CSS) */}
                  <div className="relative w-full h-[400px] bg-[#09090b] border border-[#27272a] overflow-hidden flex items-center justify-center rounded-lg">
                      {/* Dotted Grid Background */}
                      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwemIiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjUpIi8+PC9zdmc+')]"></div>
                      
                      {/* Scanning Line */}
                      <motion.div 
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4f46e5]/50 to-transparent shadow-[0_0_15px_rgba(212,165,116,0.6)] z-10"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      />
                      
                      {/* World Map SVG Abstract Outline */}
                      <div className="absolute inset-0 opacity-5 flex justify-center items-center pointer-events-none">
                          <svg viewBox="0 0 1000 500" className="w-full h-full fill-[#4f46e5] stroke-none">
                              <path d="M100,100 Q150,50 200,120 T300,150 T400,100 T500,200 T600,150 T700,220 T800,100 T900,180 V400 H100 Z" />
                          </svg>
                      </div>

                      {/* Pulses */}
                      <AnimatePresence>
                          {pulses.map((pulse) => (
                              <motion.div 
                                  key={pulse.id}
                                  initial={{ opacity: 1, scale: 0 }}
                                  animate={{ opacity: 0, scale: pulse.isHighPriority ? 5 : 3 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                  className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 border-2 ${pulse.isHighPriority ? 'border-[#ef4444] bg-[#ef4444]/20' : 'border-[#10b981] bg-[#10b981]/20'}`}
                                  style={{ left: `${pulse.x}%`, top: `${pulse.y}%`, width: pulse.isHighPriority ? '40px' : '20px', height: pulse.isHighPriority ? '40px' : '20px' }}
                              />
                          ))}
                      </AnimatePresence>

                      {/* Location Markers */}
                      {pulses.map((pulse) => (
                          <div key={`${pulse.id}-marker`} className="absolute" style={{ left: `${pulse.x}%`, top: `${pulse.y}%` }}>
                              <div className={`w-1.5 h-1.5 ${pulse.isHighPriority ? 'bg-[#ef4444]' : 'bg-[#10b981]'} rounded-full`}></div>
                          </div>
                      ))}

                      <div className="absolute bottom-4 left-4 text-[9px] font-arabic text-[#71717a]  ">
                          رادار التريندات والمؤشرات النشطة
                      </div>
                  </div>
               </div>

               {/* Optional Bento Card Row under Map */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#121214]  rounded-xl border border-[#27272a] p-6 shadow-sm group hover:border-[#10b981]/50 transition-colors">
                     <div className="flex items-center gap-3 mb-2">
                        <Flame className="w-5 h-5 text-[#10b981]" />
                        <h4 className="text-lg font-bold text-[#fafafa] font-arabic">أكثر الكلمات تداولاً</h4>
                     </div>
                     <p className="text-[12px] text-[#a1a1aa] font-arabic">تحليل لتردد المصطلحات عبر المنصات خلال الـ 24 ساعة الماضية.</p>
                  </div>
                  <div className="bg-[#121214]  rounded-xl border border-[#27272a] p-6 shadow-sm group hover:border-[#4f46e5]/50 transition-colors">
                     <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-[#4f46e5]" />
                        <h4 className="text-lg font-bold text-[#fafafa] font-arabic">التوقعات الفيروسية</h4>
                     </div>
                     <p className="text-[12px] text-[#a1a1aa] font-arabic">خوارزميات التنبؤ بصعود وسقوط التوجهات الحالية.</p>
                  </div>
               </div>
          </div>

          {/* Side Panel: Matrix Sentiment Analysis (Spans 4 cols) */}
          <div className="lg:col-span-4 bg-[#121214]  rounded-xl border border-[#27272a] flex flex-col h-[650px] shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#27272a] via-[#4f46e5] to-[#27272a]" />
              <div className="p-5 border-b border-[#27272a] bg-[#121214] flex items-center justify-between">
                  <span className="text-[10px] font-arabic font-bold text-[#4f46e5]   flex items-center gap-2">
                     <Database className="w-4 h-4" /> تدفق البيانات الحية
                  </span>
                  <div className="w-2 h-2 bg-[#4f46e5] animate-pulse rounded-full" />
              </div>
              
              <div className="flex-1 p-5 overflow-hidden relative font-arabic text-[10px]  leading-relaxed flex flex-col justify-start bg-[#09090b]/50">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#09090b]/90 z-10 h-full"></div>
                  
                  <AnimatePresence>
                      {matrixText.map((text, i) => (
                          <motion.div 
                              key={i + text}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1 - (i * 0.1), x: 0 }}
                              className={`mb-3 p-3 rounded-lg border border-[#27272a]/50 bg-[#121214] font-arabic ${text.includes('ALERT') ? 'text-[#ef4444] border-[#ef4444]/20' : text.includes('GLOBAL_PULSE') ? 'text-[#10b981]' : 'text-[#a1a1aa]'} line-clamp-2 leading-relaxed shadow-sm`}
                          >
                              {'> '} {text}
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
              
              <div className="p-5 border-t border-[#27272a] bg-[#121214]/80 mt-auto">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-arabic text-[#a1a1aa]  ">مستوى الخطر</span>
                     <span className="text-[10px] font-arabic text-[#4f46e5] font-bold px-2 py-1 bg-[#27272a] rounded-lg border border-[#4f46e5]/30">اهتمام مرتفع</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#27272a] to-[#4f46e5] w-[65%]" />
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
