import React, { useState, useEffect } from 'react';
import {
  Radar,
  Archive,
  Eye,
  FileText,
  Zap,
  Calendar,
  Activity,
  Terminal,
  Clock,
  ArrowUpRight,
  Plus,
  Server,
  Cpu,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTacticalSound } from '../hooks/useTacticalSound';

export const Home: React.FC = () => {
  const { playClick, playHover } = useTacticalSound();
  const [stats, setStats] = useState({
    activeScripts: 0,
    totalScenes: 0,
  });

  const [recentScripts, setRecentScripts] = useState<any[]>([]);
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState({
    vramLoad: "5.82/6.0 GB",
    tokenRate: "85 t/s"
  });
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setSystemInfo({
            vramLoad: data.vramLoad || "5.82/6.0 GB",
            tokenRate: data.tokenRate || "85 t/s"
          });
        }
      } catch (err: any) {
        // silently handled
      }
    };

    fetchSystemInfo();
  }, []);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await fetch("/api/dossiers");
        if (res.ok) {
          const docs = await res.json();
          setRecentScripts(docs.slice(0, 3));
          
          let totalScenes = 0;
          docs.forEach((doc: any) => {
            if (doc.scenes) totalScenes += doc.scenes.length;
          });

          setStats({
            activeScripts: docs.length,
            totalScenes: totalScenes,
          });
        }
      } catch(err) {
        // silently handle offline dev server
      }
    };
    
    const fetchTrends = async () => {
       try {
           const res = await fetch("/api/trends/public");
           if (res.ok) {
               const data = await res.json();
               if(data.items) {
                   setTickerItems(data.items.slice(0, 6)); // Take top 6
               }
           }
       } catch(err) {
           // silently handle offline dev server
       }
    };

    fetchDossiers();
    fetchTrends();
  }, []);

  const navigateTo = (page: string) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: { page } }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl" onClick={playClick}>
      
      {/* Header Section */}
      <header className="relative bg-gray-50 border border-gray-200 p-10 flex flex-col lg:flex-row justify-between items-end gap-10 z-10 bracket-container overflow-hidden group">
        <div className="absolute inset-0  opacity-[0.03]" />
        
        <div className="space-y-4 relative z-10 w-full lg:w-1/2">
          <div className="flex gap-4 items-center">
            <div className="w-1 h-10 bg-red-600 shadow-[0_0_15px_#dc2626]" />
            <div className="flex flex-col gap-1">
              <h2 className="text-5xl font-black text-gray-900 tracking-widest font-arabic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase">
                غرفة العمليات 
                <span className="font-mono text-cyan-400 ml-4">[WAR_ROOM_v1.0]</span>
              </h2>
              <span className="data-text text-gray-500 text-[10px] tracking-[0.4em] font-bold">
                OPS_COMMAND // KERNEL: SECURE // SIG: ENCRYPTED
              </span>
            </div>
          </div>
          <p className="text-gray-600 font-mono text-[11px] max-w-2xl leading-relaxed uppercase tracking-wider">
            Neural monitoring session A1 established. Targeting ingress signals across public domains. Deploying spectral surveillance protocols. Accessing restricted dossier vault.
          </p>
        </div>
        
        {/* Live Telemetry Panel */}
        <div className="w-full lg:w-1/2 flex flex-col items-end gap-5 text-right relative z-10 mt-6 lg:mt-0 font-mono">
            <div className="flex w-full sm:w-auto items-center gap-6 px-6 py-4 bg-white shadow-sm bracket-container text-[10px] uppercase tracking-widest border-gray-200 neon-glow-cyan">
                <div className="flex items-center gap-3">
                    <Server size={14} className="neon-cyan animate-pulse" />
                    <span className="text-gray-500">VRAM_LOAD:</span>
                    <span className="font-black text-gray-900 tracking-widest">{systemInfo.vramLoad}</span>
                </div>
                <div className="w-px h-5 bg-gray-100"></div>
                <div className="flex items-center gap-3">
                    <Cpu size={14} className="neon-amber" />
                    <span className="text-gray-500">STREAM_RATE:</span>
                    <span className="font-black text-gray-900 tracking-widest">{systemInfo.tokenRate}</span>
                </div>
            </div>
            
            <div className="flex w-full sm:w-auto justify-end gap-10 data-text text-gray-500 text-[9px]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rotate-45 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                    AGENTS_LINKED: [03]_STABLE
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rotate-45 bg-red-600 shadow-[0_0_10px_#dc2626]"></div>
                    SIG_STRENGTH: 98%
                </div>
            </div>
        </div>
      </header>

      {/* Trend Ticker */}
      <div className="w-full bg-white shadow-sm border-y border-gray-200 overflow-hidden py-3 relative z-10">
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10 flex items-center pr-10 border-r border-gray-200">
            <span className="data-text font-black text-red-600 flex items-center gap-3 tracking-[0.2em]">
                <Activity size={14} className="animate-pulse" /> LIVE_PULSE
            </span>
        </div>
        <div className="animate-marquee-infinite whitespace-nowrap inline-flex gap-16 items-center data-text text-gray-500 pr-40 font-mono font-bold uppercase transition-all">
            {[...Array(2)].map((_, i) => (
                <React.Fragment key={`marquee-group-${i}`}>
                    {tickerItems.length > 0 ? tickerItems.map((item, idx) => (
                        <React.Fragment key={`item-${idx}`}>
                            <div className="flex items-center gap-3">
                                <span className={idx % 2 === 0 ? "neon-amber" : "text-gray-600"}>
                                    [{idx % 2 === 0 ? "SPIKE" : "UNIT"}] {item.title}
                                </span>
                                <span className="w-1 h-1 bg-gray-100 rounded-full"></span>
                            </div>
                        </React.Fragment>
                    )) : (
                        <span className="text-gray-500 tracking-[0.4em]">[ SCANNING_PUBLIC_NODES // AWAITING_INGRESS ]</span>
                    )}
                </React.Fragment>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 relative">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="data-text text-gray-900 flex items-center gap-3">
                 <Database size={16} className="neon-cyan" />
                 [DOSSIER_VAULT] // آخر التقارير الموثقة
              </h3>
              <button onClick={() => navigateTo('archive')} className="data-text text-gray-600 hover:text-gray-900 transition-all cursor-pointer flex items-center gap-2 group">
                 ACCESS_ALL <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
           </div>
           
           <div className="grid gap-6">
              {recentScripts.length > 0 ? recentScripts.map((script, idx) => {
                 const isTopSecret = idx % 2 === 0;
                 return (
                 <div key={idx} onClick={() => navigateTo('archive')} className="p-6  relative overflow-hidden group cursor-pointer transition-all hover:border-gray-300 hover:bg-white/[0.04]">
                    <div className="absolute inset-0  opacity-[0.02]" />
                    <div className={`absolute top-0 right-0 w-32 h-32 border-b border-l border-gray-200 bg-gradient-to-bl ${isTopSecret ? 'from-[#eb2630]/5' : 'from-cyan-500/5'} to-transparent transition-all group-hover:scale-110`}></div>
                    
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <span className={`data-text px-2.5 py-1 border ${isTopSecret ? 'border-[#eb2630]/30 text-[#eb2630] bg-[#eb2630]/5 shadow-[0_0_15px_rgba(235,38,48,0.1)]' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]'}`}>
                           {isTopSecret ? '[TOP SECRET]' : '[CLASSIFIED]'}
                        </span>
                        <span className="data-text text-gray-500">FILE_REF: 0x{script.id?.slice(-4) || 'NULL'} // T: {new Date(script.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    
                    <h4 className="text-xl font-arabic font-black text-gray-900 mb-3 group-hover:neon-cyan transition-all relative z-10">{script.video_title || "UNRESOLVED_ASSET"}</h4>
                    <p className="text-sm font-arabic text-gray-600 leading-relaxed font-medium line-clamp-2 relative z-10">
                        {script.scenes && script.scenes.length > 0 ? script.scenes[0].text : 'جاري انتظار بيانات سحب العينات من المحرك المركزي...'}
                    </p>
                    
                    <div className="mt-4 flex justify-between items-center relative z-10">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 data-text text-gray-500">
                          <Clock size={10} /> {Math.floor(Math.random() * 10)}M_AGO
                        </div>
                      </div>
                      <span className="data-text text-gray-900/0 group-hover:text-gray-500 transition-all">VIEW_FILE // PULL</span>
                    </div>
                </div>
                 );
              }) : (
                <div className="p-12 bg-white border border-gray-200 shadow-md rounded-xl border-dashed border-gray-200 text-center flex flex-col items-center gap-4 relative overflow-hidden group cursor-pointer" onClick={() => navigateTo('scriptEditor')}>
                   <div className="absolute inset-0  opacity-[0.03]" />
                   <Database size={32} className="text-gray-400 group-hover:neon-red group-hover:scale-110 transition-all" />
                   <p className="data-text text-gray-500 group-hover:text-gray-600 transition-colors">ERR: DB_0_INTEL // جاري انتظار أول مدخلات استخباراتية</p>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="data-text text-gray-900 flex items-center gap-3">
                 <Terminal size={16} className="text-gray-600" />
                 [CORE_OPS] // الأوامر الأساسية
              </h3>
           </div>
           
           <div className="grid grid-cols-1 gap-4 relative z-10">
               <ActionCard 
                 title="توليد المحتوى البصري" 
                 desc="EXTRACT_INTEL_ASSETS" 
                 icon={Zap} 
                 color="neon-cyan"
                 bg="bg-white shadow-sm hover:bg-cyan-500/[0.03] hover:border-cyan-500/40 neon-glow-cyan"
                 onClick={() => navigateTo('content')}
               />
               <ActionCard 
                 title="تحرير السكريبتات" 
                 desc="LOG_PROTOCOL_UPDATE" 
                 icon={FileText} 
                 color="neon-amber"
                 bg="bg-white shadow-sm hover:bg-amber-500/[0.03] hover:border-amber-500/40"
                 onClick={() => navigateTo('scriptEditor')}
               />
               <ActionCard 
                 title="المرصد الاستراتيجي" 
                 desc="TARGET_RELATIONSHIP_MAP" 
                 icon={Eye} 
                 color="neon-red"
                 bg="bg-white shadow-sm hover:bg-red-500/[0.03] hover:border-red-500/40"
                 onClick={() => navigateTo('graph')}
               />
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
              <h4 className="data-text mb-4 text-gray-600">INTERNAL_TELEMETRY</h4>
              <div className="space-y-3">
                {[
                  { label: "NEURAL_UPTIME", val: "99.98%" },
                  { label: "SYNC_STATUS", val: "LOCKED" },
                  { label: "U_UID", val: "BWRZ-01" },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-gray-600">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, color, bg, onClick }: any) {
   const { playClick, playHover } = useTacticalSound();
   return (
      <div 
         onClick={() => {
           onClick();
           playClick();
         }}
         onMouseEnter={playHover}
         className={`p-6 bracket-container transition-all duration-200 cursor-pointer flex items-center gap-6 group border-gray-200 relative overflow-hidden ${bg}`}
      >
         <div className="absolute inset-0  opacity-[0.02]" />
         <div className="p-4 bg-gray-50 border border-gray-200 bracket-corners relative z-10">
             <Icon size={20} className={`${color} opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110`} />
         </div>
         <div className="flex-1 relative z-10">
            <h3 className="text-base font-black font-arabic text-gray-900 mb-1 group-hover:text-cyan-400 transition-all">{title}</h3>
            <p className="data-text text-gray-500 group-hover:text-gray-600 transition-colors uppercase text-[9px] tracking-widest">{desc}</p>
         </div>
         <ArrowUpRight size={14} className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 text-cyan-400 transition-all" />
      </div>
   )
}
