import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { generateAndPlayTTS, stopTTS } from '../services/ttsService';

export const TtsScratchTrack: React.FC<{ text: string }> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      await stopTTS();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    await generateAndPlayTTS(text, () => setIsSpeaking(false));
  };

  return (
    <button 
      onClick={handleSpeak}
      className={`flex items-center gap-2 p-2 border ${isSpeaking ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-zinc-800 bg-zinc-900 text-zinc-300'} active:scale-95 transition-none`}
    >
      {isSpeaking ? <Square size={12} fill="currentColor" /> : <Play size={12} />}
      <span className="text-[9px] font-arabic ">{isSpeaking ? 'جاري التشغيل...' : 'توليد مبدئي'}</span>
    </button>
  );
};
