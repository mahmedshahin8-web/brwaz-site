import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Target } from 'lucide-react';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom radar icon
const radarIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMGFmZjAwdCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiLz48L3N2Zz4=',
    iconSize: [24, 24],
    className: 'animate-pulse'
});

export const TacticalRadar: React.FC = () => {
    const [nodes, setNodes] = useState<any[]>([]);

    useEffect(() => {
        const fetchRadar = async () => {
            const req = await fetch('/api/rag/radar_nodes');
            const res = await req.json();
            if (res.success) {
                setNodes(res.nodes);
            }
        };
        fetchRadar();
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Offline Tactical Radar
                </span>
            </div>
            <div className="flex-1 relative z-0">
                <MapContainer center={[30.0444, 31.2357]} zoom={11} style={{ height: '100%', width: '100%', backgroundColor: '#000' }} zoomControl={false}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {nodes.map((node) => (
                        <Marker key={node.id} position={[node.lat, node.lng]} icon={radarIcon}>
                            <Popup className="font-arabic">
                                <span className="font-bold">{node.label}</span>
                                <br />
                                <span className="text-[10px] font-mono text-gray-600">SEVERITY: {node.severity}</span>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};
