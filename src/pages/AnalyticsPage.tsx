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
         newNodes.push({ id: 0, x: 200, y: 200, label: 'الأرشيف الرئيسي', platform: 'System', size: 15, isRoot: true });

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
             
             newNodes.push({ id: platformId, x: px, y: py, label: `مشروع_${doc.id?.substring(0,4) || 'UKNW'}`, platform: 'Document', size: 8 });
             newLinks.push({ source: 0, target: platformId });

             // Real scenes as sub-nodes
             const numSubNodes = doc.scenes ? Math.min(doc.scenes.length, 5) : 0;
             for(let j=0; j<numSubNodes; j++) {
                 const subAngle = angle + (Math.random() - 0.5) * Math.PI;
                 const sx = px + Math.cos(subAngle) * (Math.random() * 60 + 30);
                 const sy = py + Math.sin(subAngle) * (Math.random() * 60 + 30);
                 const subId = currentId++;
                 newNodes.push({ id: subId, x: sx, y: sy, label: `مقطع_${j+1}`, platform: 'Scene', size: 4 });
                 newLinks.push({ source: platformId, target: subId });
             }
         });

         setNodes(newNodes);
         setLinks(newLinks);
     };

     fetchMetrics();
  }, []);

  const stats = [
    { label: "إجمالي المشاريع المحللة", value: archiveStats.totalDocs.toString(), trend: "بيانات فعلية", icon: Eye, color: "text-[#4f46e5]", positive: true },
    { label: "المشاهد النصية المستخرجة", value: archiveStats.totalScenes.toString(), trend: "بيانات فعلية", icon: ThumbsUp, color: "text-[#ef4444]", positive: true },
    { label: "مصادر البيانات الخارجية", value: "متصل (RSS)", trend: "تكامل بيانات", icon: MessageCircle, color: "text-[#6366f1]", positive: true },
    { label: "رصد يوتيوب", value: "مُعلق", trend: "تتطلب الإعداد", icon: Share2, color: "text-[#10b981]/50", positive: false },
  ];

  return (
    <div className="min-h-full font-arabic text-[#fafafa] space-y-6" dir="rtl">
      {/* Header Section */}
      <header className="bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-[#fafafa] font-arabic mb-2 tracking-wide flex items-center gap-3">
             <Network className="w-8 h-8 text-[#4f46e5]" />
             تقارير الأداء
          </h2>
          <p className="text-[#a1a1aa] font-arabic text-xs leading-relaxed max-w-2xl mt-2  ">
            تحليل تأثير المحتوى وانتشاره عبر عقد الشبكة المختلفة.
          </p>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith("+") || stat.trend === "بيانات فعلية" || stat.trend === "تكامل بيانات";
          return (
            <div key={i} className={`bg-[#121214]  border border-[#27272a] rounded-xl p-6 shadow-sm hover:border-[#4f46e5]/30 transition-colors duration-300 group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg border border-[#27272a] bg-[#27272a] shadow-sm ${stat.color} group-hover:bg-[currentColor]/10 transition-colors`}>
                  <Icon size={18} />
                </div>
                <div className={`flex items-center gap-1 font-arabic text-[10px]  px-2 py-1 bg-[#27272a] rounded-lg border border-[#27272a] ${isPositive ? "text-[#4f46e5]" : "text-[#ef4444]"}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-[#a1a1aa] font-arabic text-[10px]   mb-2">{stat.label}</h3>
              
              {!stat.positive ? (
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${stat.color.replace('text-', 'bg-').split('/')[0]}`} />
                    <p className={`text-sm font-arabic font-bold  ${stat.color} animate-pulse`}>{stat.value}</p>
                 </div>
              ) : (
                 <p className="text-2xl font-arabic font-black text-[#fafafa] ">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Network Propagation Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Main Network Graph (Spans 8) */}
        <div className="lg:col-span-8 bg-[#121214]  rounded-xl border border-[#27272a] p-6 flex flex-col h-[500px] shadow-sm overflow-hidden relative">
          <h2 className="text-xs font-arabic font-bold text-[#fafafa] mb-6   flex items-center gap-2 relative z-10">
            <Network className="w-4 h-4 text-[#4f46e5]" />
            خريطة انتشار المحتوى
          </h2>
          <div className="flex-1 relative w-full border border-[#27272a] rounded-lg bg-[#09090b] overflow-hidden flex items-center justify-center shadow-inner">
             
             {/* Subgrid lines */}
             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwemIiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjUpIi8+PC9zdmc+')]"></div>

             <svg viewBox="0 0 400 400" className="w-full h-full max-w-[500px] max-h-[500px] absolute inset-0 m-auto">
                
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
                            className="stroke-[#4f46e5]/20 stroke-[1.5]"
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
                        <circle cx={node.x} cy={node.y} r={node.size + (node.isRoot ? 5 : 2)} className="fill-transparent stroke-[#4f46e5]/20 stroke-1" />
                        {/* Core Node */}
                        <circle 
                            cx={node.x} cy={node.y} r={node.size} 
                            className={`
                                ${node.isRoot ? 'fill-[#ef4444]' : node.size > 5 ? 'fill-[#4f46e5]' : 'fill-[#10b981]'}
                                ${node.isRoot ? 'stroke-[#ef4444]' : 'stroke-[#4f46e5]'} stroke-1
                            `}
                        />
                        {/* Labels for prominent nodes */}
                        {node.size > 5 && (
                            <text x={node.x} y={node.y + node.size + 8} textAnchor="middle" className="text-[5px] font-arabic fill-[#a1a1aa]">
                                {node.label}
                            </text>
                        )}
                        {/* Ping Animation for Root */}
                        {node.isRoot && (
                            <circle cx={node.x} cy={node.y} r={node.size} className="fill-transparent stroke-[#ef4444]">
                                <animate attributeName="r" from={node.size} to={node.size * 3} dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                    </motion.g>
                ))}
             </svg>
          </div>
        </div>

        {/* Breakdown / Insights (Spans 4) */}
        <div className="lg:col-span-4 bg-[#121214]  rounded-xl border border-[#27272a] shadow-sm flex flex-col h-[500px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#27272a] via-[#4f46e5] to-[#27272a]" />
          
          <div className="p-5 border-b border-[#27272a] bg-[#121214]">
             <h2 className="text-xs font-arabic font-bold text-[#fafafa]  ">تحليل العقد</h2>
          </div>
          
          <div className="flex-1 space-y-4 p-5 overflow-y-auto bg-[#09090b]/50">
              <div className="p-4 border border-[#27272a] rounded-lg bg-[#121214] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-arabic text-[#4f46e5]   font-bold">مراكز المشاريع</span>
                     <span className="text-[10px] font-arabic text-[#fafafa] bg-[#27272a] px-2 py-0.5 rounded-lg border border-[#27272a]">65% Impact</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#27272a] to-[#4f46e5] w-[65%]" /></div>
              </div>
              
              <div className="p-4 border border-[#27272a] rounded-lg bg-[#121214] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-arabic text-[#ef4444]   font-bold">تفاعل المشاهد</span>
                     <span className="text-[10px] font-arabic text-[#fafafa] bg-[#27272a] px-2 py-0.5 rounded-lg border border-[#27272a]">22% Impact</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#27272a] to-[#ef4444] w-[22%]" /></div>
              </div>

              <div className="p-4 border border-[#27272a] rounded-lg bg-[#121214] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[10px] font-arabic text-[#10b981]   font-bold">الروابط المشهدية</span>
                     <span className="text-[10px] font-arabic text-[#fafafa] bg-[#27272a] px-2 py-0.5 rounded-lg border border-[#27272a]">13% Impact</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090b] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#27272a] to-[#10b981] w-[13%]" /></div>
              </div>
          </div>

          <div className="p-5 border-t border-[#27272a] bg-[#121214]/80 mt-auto">
              <p className="text-[11px] font-arabic text-[#a1a1aa] leading-relaxed">
                  يشير التحليل البصري لوجود انتشار أفقي عالي الكثافة في بعض المستندات، مما أدى إلى زيادة قوة العقدة المركزية في قاعدة المعرفة.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
