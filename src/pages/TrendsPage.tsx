import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, TrendingUp, Search, Activity, GitCommit, Database, Radio } from "lucide-react";

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState("map");
  const [pulses, setPulses] = useState<any[]>([]);
  const [matrixText, setMatrixText] = useState<string[]>([]);

  // Simulation of pulses on map and Data Fetching
  useEffect(() => {
    let rssItems: any[] = [];
    
    const fetchRealTrends = async () => {
      try {
        const res = await fetch('/api/trends/public');
        if(res.ok) {
          const data = await res.json();
          if(data.success && data.items) {
             rssItems = data.items;
          }
        }
      } catch(e) {
        // silently ignore
      }
    };

    fetchRealTrends();

    const pulseInterval = setInterval(() => {
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 80 + 10;
      const id = Date.now();
      const isHighPriority = Math.random() > 0.8;
      
      setPulses(prev => [...prev.slice(-4), { id, x, y, isHighPriority }]);
      
      // Update Matrix Text with Real Data from RSS
      if (rssItems.length > 0) {
         const randomItem = rssItems[Math.floor(Math.random() * rssItems.length)];
         const sentimentOptions = ["[SENTIMENT: MIXED]", "[SENTIMENT: ALERT]", "[SENTIMENT: WATCHING]", "[GLOBAL_PULSE]"];
         const randomSentiment = sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
         setMatrixText(prev => [`${randomSentiment} ${randomItem.title}`, ...prev].slice(0, 15));
      } else {
         const fallback = [
           "[SCANNING] Awaiting signal lock from public APIs...",
           "[RECALIBRATING] Modulating frequencies...",
           "[LISTENING] External feed parsing in progress..."
         ];
         setMatrixText(prev => [fallback[Math.floor(Math.random() * fallback.length)], ...prev].slice(0, 15));
      }

    }, 2500);
    return () => clearInterval(pulseInterval);
  }, []);

  const tabs = [
    { id: "map", label: "الخريطة الحرارية (HEATMAP)", icon: Flame },
    { id: "keywords", label: "الكلمات النشطة", icon: Activity },
  ];

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 p-8 space-y-6" dir="rtl">
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-6 relative z-10">
        <div className="flex items-center gap-3 text-cyan-400">
          <Radio className="w-5 h-5 animate-pulse" />
          <h1 className="text-3xl font-arabic font-black tracking-tighter uppercase leading-none">[GLOBAL_RADAR] // المرصد التكتيكي</h1>
        </div>
        <p className="text-gray-600 font-mono text-xs leading-relaxed max-w-2xl mt-2 uppercase tracking-widest">
          مسح الترددات النشطة في الشبكة العالمية. التقاط النبضات وإشارات الاستخبارات.
        </p>
      </header>

      {/* Grid: Map + Matrix Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Heatmap Area */}
          <div className="lg:col-span-3 space-y-4">
               {/* Controls */}
              <div className="flex justify-between items-center bg-white p-4 border border-gray-200">
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#eb2630]/10 border border-[#eb2630]/30 text-[#eb2630] font-mono text-[9px] tracking-widest uppercase">
                        <div className="w-1.5 h-1.5 bg-[#eb2630] rounded-full animate-pulse" /> High_Priority
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[9px] tracking-widest uppercase">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> Normal
                    </div>
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                    SYNC_RATE: 2000ms
                </div>
              </div>

               {/* The Map (Simulated via Canvas/CSS) */}
               <div className="relative w-full h-[500px] bg-[#000] border border-gray-200 overflow-hidden flex items-center justify-center">
                   {/* Dotted Grid Background */}
                   <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwemIiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjUpIi8+PC9zdmc+')]"></div>
                   
                   {/* Scanning Line */}
                   <motion.div 
                     className="absolute inset-x-0 h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.8)] z-10"
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                   />
                   
                   {/* World Map SVG Abstract Outline */}
                   <div className="absolute inset-0 opacity-10 flex justify-center items-center pointer-events-none">
                       {/* SVG path of map placeholder */}
                       <svg viewBox="0 0 1000 500" className="w-full h-full fill-white stroke-none">
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
                               className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 border-2 ${pulse.isHighPriority ? 'border-[#eb2630] bg-[#eb2630]/20' : 'border-cyan-400 bg-cyan-400/20'}`}
                               style={{ left: `${pulse.x}%`, top: `${pulse.y}%`, width: pulse.isHighPriority ? '40px' : '20px', height: pulse.isHighPriority ? '40px' : '20px' }}
                           />
                       ))}
                   </AnimatePresence>

                   {/* Location Markers */}
                   {pulses.map((pulse) => (
                       <div key={`${pulse.id}-marker`} className="absolute" style={{ left: `${pulse.x}%`, top: `${pulse.y}%` }}>
                           <div className={`w-1.5 h-1.5 ${pulse.isHighPriority ? 'bg-[#eb2630]' : 'bg-cyan-400'} rounded-full`}></div>
                       </div>
                   ))}

                   <div className="absolute bottom-4 left-4 text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em]">
                       OP_RADAR // ACTIVE_SURVEILLANCE
                   </div>
               </div>
          </div>

          {/* Side Panel: Matrix Sentiment Analysis */}
          <div className="lg:col-span-1 border border-gray-200 bg-white flex flex-col h-[500px] mt-[68px]">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                     <Database className="w-3 h-3" /> INTEL_STREAM
                  </span>
                  <div className="w-2 h-2 bg-green-500 animate-pulse" />
              </div>
              <div className="flex-1 p-4 overflow-hidden relative font-mono text-[10px] uppercase leading-relaxed flex flex-col justify-start">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-gray-50 z-10 h-full"></div>
                  
                  <AnimatePresence>
                      {matrixText.map((text, i) => (
                          <motion.div 
                              key={i + text}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1 - (i * 0.1), y: 0 }}
                              className={`mb-2 font-mono ${text.includes('ALERT') ? 'text-[#eb2630]' : text.includes('GLOBAL_PULSE') ? 'text-green-400' : 'text-green-500/60'} line-clamp-2 leading-relaxed`}
                          >
                              {'> '} {text}
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Global_Threat_Level</span>
                     <span className="text-[9px] font-mono text-blue-600 font-bold">ELEVATED</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100">
                      <div className="h-full bg-blue-600 w-[65%]" />
                  </div>
              </div>
          </div>

      </div>

    </div>
  );
}
