import React, { useState } from 'react';
import { Play } from 'lucide-react';

export const TtsScratchTrack: React.FC<{ text: string }> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-EG";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button 
      onClick={handleSpeak}
      className="flex items-center gap-2 p-2 border border-zinc-800 bg-zinc-900 text-zinc-300 active:scale-95 transition-none"
    >
      <Play size={12} />
      <span className="text-[9px] font-mono uppercase">{isSpeaking ? 'Recording...' : 'Play_Scratch'}</span>
    </button>
  );
};
