import { apiFetch } from "../lib/apiFetch";
import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Zap, Maximize, Target, Activity } from 'lucide-react';

export const KnowledgeGraphPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<any>(null);

  const [rawDocs, setRawDocs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/dossiers')
      .then(res => res.json())
      .then(docs => setRawDocs(docs))
      .catch(console.error);
  }, []);

  const graphData = useMemo(() => {
    const nodes: any[] = [{ id: 'CORE', group: 0, name: 'T_NEXUS', val: 20 }];
    const links: any[] = [];

    if (rawDocs.length > 0) {
      rawDocs.forEach((doc, idx) => {
        nodes.push({ id: `doc_${idx}`, group: 1, name: doc.video_title || doc.title || `DOC_${idx}`, val: 10 });
        links.push({ source: 'CORE', target: `doc_${idx}`, value: 2 });
        if (doc.scenes && doc.scenes.length > 0) {
           doc.scenes.slice(0, 3).forEach((scene: any, sIdx: number) => {
              const sId = `scene_${idx}_${sIdx}`;
              nodes.push({ id: sId, group: 2, name: `EVIDENCE_${sIdx}`, val: 5 });
              links.push({ source: `doc_${idx}`, target: sId, value: 1 });
           });
        }
      });
    } else {
      // Empty state node
      nodes.push({ id: 'NO_DATA', group: 3, name: 'AWAITING_INGESTION', val: 8 });
      links.push({ source: 'CORE', target: 'NO_DATA', value: 1 });
    }

    return { nodes, links };
  }, [rawDocs]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="min-h-full font-arabic text-[#fafafa] space-y-6" dir="rtl">
      
      {/* Header Section */}
      <header className="bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-[#fafafa] font-arabic mb-2 tracking-wide flex items-center gap-3">
             <Zap className="w-8 h-8 text-[#4f46e5] animate-pulse" />
             [KNOWLEDGE_GRAPH] // رادار الكيانات
          </h2>
          <p className="text-[#a1a1aa] font-mono text-xs leading-relaxed max-w-2xl mt-2 uppercase tracking-widest">
            خريطة الروابط الاستخباراتية وشبكة البيانات بين المشاريع والأدلة.
          </p>
        </div>
        
        <div className="flex gap-4 relative z-10">
           <div className="flex flex-col items-center justify-center px-4 py-2 bg-[#27272a]/50 rounded-lg border border-[#4f46e5]/20 backdrop-blur">
              <span className="text-[9px] text-[#71717a] font-bold font-mono uppercase tracking-widest flex items-center gap-1"><Activity size={10} className="text-[#4f46e5]" /> ACTIVE_NODES</span>
              <span className="text-[#fafafa] font-bold font-mono text-lg">{graphData.nodes.length}</span>
           </div>
           <div className="flex flex-col items-center justify-center px-4 py-2 bg-[#27272a]/50 rounded-lg border border-[#4f46e5]/20 backdrop-blur">
              <span className="text-[9px] text-[#71717a] font-bold font-mono uppercase tracking-widest flex items-center gap-1"><Target size={10} className="text-[#10b981]" /> ACTIVE_LINKS</span>
              <span className="text-[#fafafa] font-bold font-mono text-lg">{graphData.links.length}</span>
           </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Graph Container (Spans 12 cols in this case to be wide) */}
        <div className="lg:col-span-12 relative bg-[#121214]  rounded-xl border border-[#27272a] shadow-sm overflow-hidden h-[600px] flex flex-col" ref={containerRef}>
            
           {/* Legend Area */}
           <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
              <div className="text-[10px] font-mono border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] px-3 py-1 flex items-center gap-3 rounded-lg  shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" /> T_NEXUS
              </div>
              <div className="text-[10px] font-mono border border-[#4f46e5]/30 bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 flex items-center gap-3 rounded-lg  shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#4f46e5]" /> DOSSIERS
              </div>
              <div className="text-[10px] font-mono border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981] px-3 py-1 flex items-center gap-3 rounded-lg  shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" /> EVIDENCE
              </div>
           </div>

         {/* Grid Background Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] pointer-events-none opacity-50 mix-blend-screen z-0"></div>

         {/* Tooltip */}
         {hoverNode && (
            <div className="absolute top-4 right-4 z-10 bg-[#121214]  border border-[#4f46e5]/50 p-4 max-w-xs pointer-events-none">
              <h3 className="font-mono text-xs text-[#4f46e5] uppercase tracking-widest mb-1">{hoverNode.name}</h3>
              <p className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest">ID: {hoverNode.id}</p>
              <p className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest mt-2">{hoverNode.group === 0 ? 'CENTRAL_NEXUS' : hoverNode.group === 1 ? 'DOSSIER_NODE' : 'EVIDENCE_FRAGMENT'}</p>
            </div>
         )}
         
         <div className="relative z-10 w-full h-full mix-blend-screen">
           <ForceGraph2D
             graphData={graphData}
             width={dimensions.width}
             height={dimensions.height}
             backgroundColor="transparent"
             nodeColor={node => {
                if (node.group === 0) return '#ef4444'; 
                if (node.group === 1) return '#4f46e5'; 
                if (node.group === 2) return '#10b981'; 
                return '#444';
             }}
             linkColor={() => 'rgba(212,165,116,0.15)'}
             nodeRelSize={4}
             onNodeHover={(node) => setHoverNode(node)}
             linkWidth={1}
             linkDirectionalParticles={2}
             linkDirectionalParticleWidth={1.5}
             linkDirectionalParticleSpeed={0.005}
             linkDirectionalParticleColor={(link) => {
               if (link.source === 'CORE' || (link.source && (link.source as any).id === 'CORE')) return '#ef4444';
               return '#10b981';
             }}
           />
         </div>
      </div>
      
      </div>
    </div>
  );
}
