import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/apiFetch';
import { Archive, Plus, Trash, Database } from 'lucide-react';

interface PropItem {
  id: string;
  type: string;
  name: string;
  description: string;
  metadata?: any;
}

interface PropRoomPanelProps {
  onSelectProp?: (prop: PropItem) => void;
}

export const PropRoomPanel: React.FC<PropRoomPanelProps> = ({ onSelectProp }) => {
  const [props, setProps] = useState<PropItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProps = async () => {
    try {
      const res = await apiFetch("/api/props");
      const data = await res.json();
      if (Array.isArray(data)) setProps(data);
    } catch (e) {
      console.error("Failed to load props", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
  }, []);

  const addTestProp = async () => {
    const newProp = {
      id: `prop_${Date.now()}`,
      type: "B_ROLL",
      name: "Old Clock",
      description: "A vintage ticking clock suitable for dramatic pause.",
      metadata: { source: "Archives" }
    };
    try {
      await apiFetch("/api/props", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProp)
      });
      fetchProps();
    } catch (e) {}
  };

  const deleteProp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/props/${id}`, { method: "DELETE" });
      setProps(prev => prev.filter(p => p.id !== id));
    } catch (e) {}
  };

  return (
    <div className="bg-black text-white p-4 font-mono w-full h-full flex flex-col border border-gray-800 rounded-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-300 tracking-widest uppercase">
          <Database className="w-4 h-4" />
          Persistent Prop-Room
        </h3>
        <button 
          onClick={addTestProp}
          className="p-3 bg-gray-900 text-gray-300 border border-gray-700 rounded-sm active:bg-gray-800 transition-colors"
          title="Add Prop"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-gray-500 text-xs animate-pulse">LOADING_PROPS...</div>
        ) : props.length === 0 ? (
          <div className="text-gray-500 text-xs">PROP_ROOM_EMPTY</div>
        ) : (
          props.map(prop => (
            <div 
              key={prop.id} 
              onClick={() => onSelectProp?.(prop)}
              className="group p-3 border border-gray-800 bg-gray-900/50 cursor-pointer active:bg-gray-800 transition-colors flex justify-between items-start"
            >
              <div>
                <div className="text-xs font-bold text-gray-200 mb-1">[{prop.type}] {prop.name}</div>
                <div className="text-[10px] text-gray-500 line-clamp-2">{prop.description}</div>
              </div>
              <button 
                onClick={(e) => deleteProp(prop.id, e)}
                className="p-3 text-gray-600 active:text-red-500 transition-colors"
              >
                <Trash className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
