import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

interface CognitiveFatigueTrackerProps {
  requestsCount: number; // how many heavy generations
  errorsCount: number; // how many errors
  onReset: () => void;
}

export const CognitiveFatigueTracker: React.FC<CognitiveFatigueTrackerProps> = ({ requestsCount, errorsCount, onReset }) => {
  const [fatigueLevel, setFatigueLevel] = useState(0);

  useEffect(() => {
    // Arbitrary formula for cognitive fatigue
    const baseFatigue = (requestsCount * 5) + (errorsCount * 15);
    const capped = Math.min(Math.max(baseFatigue, 0), 100);
    setFatigueLevel(capped);
  }, [requestsCount, errorsCount]);

  const getColor = () => {
    if (fatigueLevel > 80) return "text-red-500";
    if (fatigueLevel > 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatus = () => {
    if (fatigueLevel > 80) return "CRITICAL_FATIGUE";
    if (fatigueLevel > 50) return "MODERATE_LOAD";
    return "OPTIMAL";
  };

  return (
    <div className="bg-black text-white p-4 font-mono w-full border border-gray-800 rounded-sm">
      <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
        <h3 className="text-xs font-bold flex items-center gap-2 text-gray-400 uppercase tracking-widest">
          <Cpu className="w-3 h-3" />
          Cognitive Fatigue Index
        </h3>
        {fatigueLevel > 80 && (
          <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" />
        )}
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className={`text-xl font-bold ${getColor()}`}>
          {fatigueLevel}%
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest">
          {getStatus()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-900 mb-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${fatigueLevel > 80 ? 'bg-red-500' : fatigueLevel > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${fatigueLevel}%` }}
        />
      </div>

      {fatigueLevel > 50 && (
        <button 
          onClick={onReset}
          className="w-full py-3 bg-gray-900 text-[10px] text-gray-300 border border-gray-700 active:bg-gray-800 transition-colors uppercase tracking-widest font-bold"
        >
          Initiate Auto-Heal Sequence
        </button>
      )}
    </div>
  );
};
