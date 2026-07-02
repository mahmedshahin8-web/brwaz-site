import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CLEARANCE_LEVELS } from '../constants/messages';
import { ShieldCheck, ShieldAlert, Terminal, Radio } from 'lucide-react';

interface CyberToastProps {
  message: string;
  level: keyof typeof CLEARANCE_LEVELS;
  onComplete?: () => void;
}

export const CyberToast: React.FC<CyberToastProps> = ({ message, level, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const clearance = CLEARANCE_LEVELS[level];

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(message.slice(0, i + 1));
      i++;
      if (i >= message.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 30); // Speed of typewriter

    // Optional: Play a subtle UI click sound if you have the assets
    // try {
    //   const audio = new Audio(clearance.sound);
    //   audio.volume = 0.1;
    //   audio.play().catch(() => {});
    // } catch (e) {}

    return () => clearInterval(interval);
  }, [message, onComplete]);

  const getIcon = () => {
    switch (level) {
      case 'CLASSIFIED': return <ShieldCheck className="w-4 h-4" />;
      case 'BREACH': return <ShieldAlert className="w-4 h-4" />;
      case 'TOP_SECRET': return <Terminal className="w-4 h-4" />;
      case 'SYSTEM_VOICE': return <Radio className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="max-w-md w-full bg-[#121214]  border-l-4 p-4 flex flex-col gap-2 shadow-[20px_0_40px_rgba(0,0,0,0.8)] pointer-events-auto"
      style={{ borderLeftColor: clearance.color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: clearance.color }}>
          {getIcon()}
          <span className="text-[10px] font-mono font-bold tracking-[0.2em]">
            {clearance.label}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: clearance.color }}></div>
      </div>
      
      <div className="text-sm font-mono text-[#fafafa]/90 leading-relaxed min-h-[1.5em]" dir="rtl">
        {displayedText}
        <span className="inline-block w-2 h-4 ml-1 bg-[#121214]  animate-[blink_1s_infinite] align-middle"></span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />
    </motion.div>
  );
};
