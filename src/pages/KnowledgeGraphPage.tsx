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
    <div className="min-h-full bg-gray-50 text-gray-900 p-6 md:p-8 space-y-6 flex flex-col" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-3 text-blue-600">
          <Zap size={24} className="animate-pulse" />
          <h1 className="text-3xl font-mono font-black tracking-tighter uppercase leading-none">[ENTITY_RADAR] // رادار الكيانات</h1>
        </div>
        <p className="text-gray-600 font-mono text-[10px] leading-relaxed mt-2 uppercase tracking-widest flex items-center gap-4">
          <span><Activity className="inline w-3 h-3 text-cyan-400 mr-1"/> ACTIVE_NODES: {graphData.nodes.length}</span>
          <span><Target className="inline w-3 h-3 text-[#eb2630] mr-1"/> LINKS: {graphData.links.length}</span>
        </p>
      </header>

      {/* Graph Container */}
      <div className="flex-1 relative bg-white border border-gray-200 overflow-hidden" ref={containerRef}>
         <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-3 py-1 flex items-center justify-center gap-2">T_NEXUS</div>
            <div className="text-[10px] font-mono border border-blue-500/30 bg-blue-600/10 text-blue-600 px-3 py-1 flex items-center justify-center gap-2">DOSSIERS</div>
            <div className="text-[10px] font-mono border border-[#eb2630]/30 bg-[#eb2630]/10 text-[#eb2630] px-3 py-1 flex items-center justify-center gap-2">EVIDENCE</div>
         </div>

         {/* Grid Background Overlay */}
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBNMzkuNSAwdi00MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] pointer-events-none opacity-50 mix-blend-screen z-0"></div>

         {/* Tooltip */}
         {hoverNode && (
            <div className="absolute top-4 right-4 z-10 bg-white border border-blue-500/50 p-4 max-w-xs pointer-events-none">
              <h3 className="font-mono text-xs text-blue-600 uppercase tracking-widest mb-1">{hoverNode.name}</h3>
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">ID: {hoverNode.id}</p>
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mt-2">{hoverNode.group === 0 ? 'CENTRAL_NEXUS' : hoverNode.group === 1 ? 'DOSSIER_NODE' : 'EVIDENCE_FRAGMENT'}</p>
            </div>
         )}
         
         <div className="relative z-10 w-full h-full mix-blend-screen">
           <ForceGraph2D
             graphData={graphData}
             width={dimensions.width}
             height={dimensions.height}
             backgroundColor="transparent"
             nodeColor={node => {
                if (node.group === 0) return '#22d3ee'; // cyan-400
                if (node.group === 1) return '#3B82F6'; // yellow
                if (node.group === 2) return '#eb2630'; // red
                return '#444';
             }}
             linkColor={() => 'rgba(255,255,255,0.1)'}
             nodeRelSize={4}
             onNodeHover={(node) => setHoverNode(node)}
             linkWidth={1}
             linkDirectionalParticles={2}
             linkDirectionalParticleWidth={1.5}
             linkDirectionalParticleSpeed={0.005}
             linkDirectionalParticleColor={(link) => {
               if (link.source === 'CORE' || (link.source && (link.source as any).id === 'CORE')) return '#22d3ee';
               return '#eb2630';
             }}
           />
         </div>
      </div>
    </div>
  );
}
