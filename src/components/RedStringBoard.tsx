import { apiFetch } from "../lib/apiFetch";
import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Activity } from 'lucide-react';

export const RedStringBoard: React.FC = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isExtracting, setIsExtracting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    }, [containerRef.current]);

    useEffect(() => {
        const fetchGraph = async () => {
            setIsExtracting(true);
            try {
                const req = await apiFetch('/api/rag/red_string_extract', { method: 'POST' });
                const res = await req.json();
                if (res.success) {
                    setGraphData({ nodes: res.nodes, links: res.links });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsExtracting(false);
            }
        };
        fetchGraph();
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-gray-900 tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#eb2630] animate-pulse"></div>
                    Red String Board
                </span>
                {isExtracting && <Activity className="w-3 h-3 text-[#eb2630] animate-spin" />}
            </div>
            <div className="flex-1 relative" ref={containerRef}>
                {dimensions.width > 0 && (
                    <ForceGraph2D
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel="id"
                        nodeColor={(node: any) => {
                            if (node.type === 'PERSON') return '#eb2630';
                            if (node.type === 'DOCUMENT') return '#3B82F6';
                            if (node.type === 'OPERATION') return '#00f0ff';
                            return '#ffffff';
                        }}
                        linkColor={() => 'rgba(235, 38, 48, 0.5)'}
                        linkWidth={2}
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkDirectionalParticles={4}
                        linkDirectionalParticleSpeed={d => d.value * 0.005}
                        backgroundColor="#ffffff"
                        onNodeClick={node => console.log('Node Selected:', node)}
                    />
                )}
            </div>
        </div>
    );
};
