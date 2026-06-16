import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '../lib/useSoundEffects';

const bootLogs = [
  "INITIALIZING BARWAZ ENGINE...",
  "LOADING NEURAL PATHWAYS...",
  "VERIFYING VRAM ALLOCATION... [OK]",
  "ESTABLISHING SECURE CONNECTION...",
  "MOUNTING ENCRYPTED ARCHIVE...",
  "WAKING UP AGENTS...",
  "CALIBRATING TACTICAL RADAR...",
  "SYNCHRONIZING TELEMETRY...",
  "SYSTEM ONLINE."
];

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const { playBoot, playTyping } = useSoundEffects();

  useEffect(() => {
    // Play boot hum
    playBoot();

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        setProgress(((currentLog + 1) / bootLogs.length) * 100);
        playTyping(); // Play typing/click sound on each new log line
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500); // 500ms before dismissing
      }
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete, playBoot, playTyping]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#27272a]/50 text-cyan-500 font-arabic flex flex-col justify-end p-8"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(0,240,255,0.05) 0%, transparent 70%)"
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZUZpbHRlcikiID48L3JlY3Q+Cjwvc3ZnPg==')] mix-blend-overlay" />
      </div>
      
      <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col justify-end h-full">
        <div className="mb-8 flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="text-4xl font-bold font-medium drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            برواز <span className="opacity-50">OS</span>
          </div>
          <div className="text-xs  opacity-70">
            v2.4.9-SECURE
          </div>
        </div>

        <div className="space-y-2 mb-8 h-48 overflow-hidden flex flex-col justify-end">
          {logs.map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-medium"
            >
              <span className="opacity-50 mr-4">{`[${String(i).padStart(3, '0')}]`}</span>
              <span className={i === bootLogs.length - 1 ? 'text-[#4f46e5] font-bold drop-shadow-[0_0_5px_rgba(240,199,34,0.8)]' : ''}>{log}</span>
            </motion.div>
          ))}
        </div>

        <div className="w-full h-1 bg-cyan-950 overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
};
