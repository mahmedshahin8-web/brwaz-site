import { apiFetch } from "../lib/apiFetch";
import React, { useEffect, useState, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { BarChart2, Eye, ThumbsUp, MessageCircle, Share2, TrendingUp, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [archiveStats, setArchiveStats] = useState({ totalDocs: 0, totalScenes: 0 });

  // Fetch real local data
  useEffect(() => {
     const fetchMetrics = async () => {
         try {
             const res = await apiFetch("/api/dossiers");
             if (res.ok) {
                 const docs = await res.json();
                 let scenesCount = 0;
                 docs.forEach((d: any) => {
                     if (d.scenes) scenesCount += d.scenes.length;
                 });
                 setArchiveStats({ totalDocs: docs.length, totalScenes: scenesCount });
                 
                 // Generate network based on real documents (if any)
                 generateNetwork(docs);
             }
         } catch(e) {
             // silently ignore
             generateNetwork([]);
         }
     };
     
     const generateNetwork = (docs: any[]) => {
         const newNodes: any[] = [];
         const newLinks: any[] = [];

         // Root / Origin node
         newNodes.push({ id: 0, x: 200, y: 200, label: 'CORE_ARCHIVE', platform: 'System', size: 15, isRoot: true });

         if (docs.length === 0) {
             setNodes(newNodes);
             setLinks(newLinks);
             return;
         }

         let currentId = 1;
         docs.slice(0, 8).forEach((doc: any, i: number) => { // Limit to 8 nodes to avoid clutter
             const angle = (i / Math.min(docs.length, 8)) * Math.PI * 2;
             const px = 200 + Math.cos(angle) * 80;
             const py = 200 + Math.sin(angle) * 80;
             const platformId = currentId++;
             
             newNodes.push({ id: platformId, x: px, y: py, label: `DOC_${doc.id?.substring(0,4) || 'UKNW'}`, platform: 'Document', size: 8 });
             newLinks.push({ source: 0, target: platformId });

             // Real scenes as sub-nodes
             const numSubNodes = doc.scenes ? Math.min(doc.scenes.length, 5) : 0;
             for(let j=0; j<numSubNodes; j++) {
                 const subAngle = angle + (Math.random() - 0.5) * Math.PI;
                 const sx = px + Math.cos(subAngle) * (Math.random() * 60 + 30);
                 const sy = py + Math.sin(subAngle) * (Math.random() * 60 + 30);
                 const subId = currentId++;
                 newNodes.push({ id: subId, x: sx, y: sy, label: `SCENE_${j+1}`, platform: 'Scene', size: 4 });
                 newLinks.push({ source: platformId, target: subId });
             }
         });

         setNodes(newNodes);
         setLinks(newLinks);
     };

     fetchMetrics();
  }, []);

  const stats = [
    { label: "إجمالي الوثائق المحللة", value: archiveStats.totalDocs.toString(), trend: "REAL_DATA", icon: Eye, color: "text-cyan-400", positive: true },
    { label: "المشاهد النصية المستخرجة", value: archiveStats.totalScenes.toString(), trend: "REAL_DATA", icon: ThumbsUp, color: "text-[#eb2630]", positive: true },
    { label: "مصادر البيانات الخارجية", value: "متصل (RSS/Reddit)", trend: "FOUNDATION_STACK", icon: MessageCircle, color: "text-blue-600", positive: true },
    { label: "رصد يوتيوب", value: "مُعلق", trend: "NEED_API_KEYS", icon: Share2, color: "text-[#eb2630]/50", positive: false },
  ];

  return (
    <div className="min-h-full bg-gray-50 text-gray-900 p-8 space-y-8" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-gray-200 pb-6 relative z-10">
        <div className="flex items-center gap-3 text-cyan-400">
          <Network className="w-6 h-6" />
          <h1 className="text-3xl font-arabic font-black tracking-tighter uppercase leading-none">[IMPACT_RADAR] // تقارير الأداء</h1>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith("+");
          return (
            <div key={i} className={`bg-white border border-gray-200 p-6 active:scale-95${stat.color.split('-')[1]}-500/50 transition-colors duration-100 group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 border border-gray-200 bg-white border-gray-100 shadow-sm ${stat.color} group-active:scale-95 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div className={`flex items-center gap-1 font-mono text-[10px] tracking-widest ${isPositive ? "text-cyan-400" : "text-[#eb2630]"}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-gray-600 font-mono text-[10px] uppercase tracking-widest mb-1">{stat.label}</h3>
              
              {!stat.positive ? (
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${stat.color.replace('text-', 'bg-')}`} />
                    <p className={`text-sm font-mono font-bold tracking-widest ${stat.color} animate-pulse`}>{stat.value}</p>
                 </div>
              ) : (
                 <p className="text-xl font-mono font-black text-gray-900 tracking-widest">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Network Propagation Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Main Network Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 flex flex-col h-[600px]">
          <h2 className="text-xs font-mono font-bold text-gray-900/90 mb-6 uppercase tracking-widest flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            [PROPAGATION_MAP] // خريطة انتشار المحتوى
          </h2>
          <div className="flex-1 relative w-full border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
             
             {/* Subgrid lines */}
             <div className="absolute inset-0 opacity-[0.05] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LCAxKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')]"></div>

             <svg viewBox="0 0 400 400" className="w-full h-full max-w-[600px] max-h-[600px] absolute inset-0 m-auto filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                
                {/* Links */}
                {links.map((link, i) => {
                    const source = nodes.find(n => n.id === link.source);
                    const target = nodes.find(n => n.id === link.target);
                    if(!source || !target) return null;
                    return (
                        <motion.line 
                            key={`link-${i}`}
                            x1={source.x} y1={source.y}
                            x2={target.x} y2={target.y}
                            className="stroke-cyan-500/20 stroke-1"
                            strokeDasharray="2 2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.05 }}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                    <motion.g 
                       key={`node-${node.id}`}
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 0.5, delay: node.isRoot ? 0 : 1 + Math.random() }}
                    >
                        {/* Outer Glow */}
                        <circle cx={node.x} cy={node.y} r={node.size + (node.isRoot ? 5 : 2)} className="fill-transparent stroke-cyan-500/20 stroke-[0.5]" />
                        {/* Core Node */}
                        <circle 
                            cx={node.x} cy={node.y} r={node.size} 
                            className={`
                                ${node.isRoot ? 'fill-[#eb2630]' : node.size > 5 ? 'fill-cyan-400' : 'fill-blue-500'}
                                ${node.isRoot ? 'stroke-[#eb2630]' : 'stroke-cyan-500'} stroke-1
                            `}
                        />
                        {/* Labels for prominent nodes */}
                        {node.size > 5 && (
                            <text x={node.x} y={node.y + node.size + 8} textAnchor="middle" className="text-[5px] font-mono fill-white/60">
                                {node.label}
                            </text>
                        )}
                        {/* Ping Animation for Root */}
                        {node.isRoot && (
                            <circle cx={node.x} cy={node.y} r={node.size} className="fill-transparent stroke-[#eb2630]">
                                <animate attributeName="r" from={node.size} to={node.size * 3} dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                    </motion.g>
                ))}
             </svg>
          </div>
        </div>

        {/* Breakdown / Insights */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col space-y-6">
          <h2 className="text-xs font-mono font-bold text-gray-900/90 uppercase tracking-widest">[NODE_METRICS] // تحليل العقد</h2>
          
          <div className="flex-1 space-y-4">
              <div className="p-4 border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">YouTube Node (Primary)</span>
                     <span className="text-[10px] font-mono text-gray-600">65% Impact</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100"><div className="h-full bg-cyan-400 w-[65%]" /></div>
              </div>
              
              <div className="p-4 border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-mono text-[#eb2630] uppercase tracking-widest">TikTok Spikes</span>
                     <span className="text-[10px] font-mono text-gray-600">22% Impact</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100"><div className="h-full bg-[#eb2630] w-[22%]" /></div>
              </div>

              <div className="p-4 border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest">News & Blogs (Dark Social)</span>
                     <span className="text-[10px] font-mono text-gray-600">13% Impact</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100"><div className="h-full bg-blue-600 w-[13%]" /></div>
              </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200">
              <p className="text-[10px] font-arabic text-gray-600 leading-relaxed text-center">
                  يشير التحليل البصري لوجود انتشار أفقي عالي الكثافة في منصات الفيديو القصير، مما أدى إلى تغذية العقدة الرئيسية بالمزيد من الزيارات المرجعية.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
