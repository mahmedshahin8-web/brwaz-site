import React, { useState, useEffect } from 'react';
import { Send, UserX, User, Activity, Zap, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';

export const InterrogationRoom: React.FC<{ scriptContent?: string }> = ({ scriptContent }) => {
    const [messages, setMessages] = useState<{role: 'user'|'persona', text: string, model?: string}[]>([]);
    const [input, setInput] = useState('');
    const [isInterrogating, setIsInterrogating] = useState(false);
    const [visualTags, setVisualTags] = useState<string[]>([]);
    const [mood, setMood] = useState<string>('NEUTRAL');
    const [isSadistMode, setIsSadistMode] = useState(false);

    // Cyber-Thriller UX: Redaction Reveal Component
    const RedactedText = ({ text }: { text: string }) => {
        return (
            <span className="bg-white text-black hover:text-gray-900/80 transition-all duration-[400ms] cursor-crosshair selection:bg-transparent">
                {text}
            </span>
        );
    };

    // Helper to auto-redact some words
    const renderWithRedaction = (text: string) => {
        const words = text.split(' ');
        return words.map((w, i) => {
            if (['الغربية', 'الجليد،', 'تحركات', 'المبצע'].includes(w) || w.startsWith('سري')) {
                return <React.Fragment key={i}><RedactedText text={w} /> </React.Fragment>;
            }
            return <React.Fragment key={i}>{w} </React.Fragment>;
        });
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const query = input;
        setMessages(prev => [...prev, { role: 'user', text: query }]);
        setInput('');
        setIsInterrogating(true);
        
        try {
            const req = await fetch('/api/rag/interrogate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, persona: 'الجبرتي' })
            });
            const res = await req.json();
            if (res.success) {
                // Simulate dual-channel streaming logic: JSON arrives first, text streams later
                if (res.data.visualTags) setVisualTags(res.data.visualTags);
                if (res.data.mood) setMood(res.data.mood);
                
                // Extract Model info
                const match = res.data.text.match(/\[ROUTED VIA: (.*?)\]\n/);
                const modelUsed = match ? match[1] : 'Unknown';
                const cleanText = res.data.text.replace(/\[ROUTED VIA: (.*?)\]\n/, '');

                setMessages(prev => [...prev, { role: 'persona', text: '', model: modelUsed }]);
                
                // Simulate typing effect
                let i = 0;
                const typingObj = setInterval(() => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const last = { ...newMsgs[newMsgs.length - 1] };
                        last.text = cleanText.substring(0, i+1);
                        newMsgs[newMsgs.length - 1] = last;
                        return newMsgs;
                    });
                    i++;
                    if (i >= cleanText.length) clearInterval(typingObj);
                }, 20); // Fast typing for Cyber-Thriller vibe
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsInterrogating(false);
        }
    };

    const handleSadistCritique = async () => {
        if (!scriptContent) return;
        setIsInterrogating(true);
        setIsSadistMode(true);
        setMessages(prev => [...prev, { role: 'user', text: "استدعي المحرر السادي (Devil's Advocate) لتقطيع هذا السكريبت إرباً." }]);

        try {
            const req = await fetch('/api/drafts/critique', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptContent })
            });
            const res = await req.json();
            if (res.success && res.result) {
                const { verdict, weaknesses, suggestions } = res.result;
                const formatted = `[VERDICT: ${verdict}]\n\n* THE FLAWS:\n${weaknesses?.map((w: string) => '- ' + w).join('\n')}\n\n* REDEMPTION PATH:\n${suggestions?.map((s: string) => '- ' + s).join('\n')}`;
                
                setMood('SADISTIC');
                setVisualTags(['CRITIQUE_ACTIVE', 'FLAWS_DETECTED']);
                setMessages(prev => [...prev, { role: 'persona', text: '', model: 'gemini-2.5-pro (Sadist)' }]);
                
                let i = 0;
                const typingObj = setInterval(() => {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        const last = { ...newMsgs[newMsgs.length - 1] };
                        last.text = formatted.substring(0, i+1);
                        newMsgs[newMsgs.length - 1] = last;
                        return newMsgs;
                    });
                    i++;
                    if (i >= formatted.length) clearInterval(typingObj);
                }, 10);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsInterrogating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    {isSadistMode ? <Gavel className="w-4 h-4 text-[#eb2630]" /> : <User className="w-4 h-4 text-[#eb2630]" />}
                    <span className="font-mono text-[10px] font-bold text-[#eb2630] uppercase tracking-widest">
                        {isSadistMode ? "SADIST EDITOR: ON" : "INTERROGATION: ON"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleSadistCritique()}
                      className={`flex items-center gap-1 text-[9px] px-2 py-1 border transition-colors ${isSadistMode ? 'text-gray-900 bg-[#eb2630]/20 border-[#eb2630]/50' : 'text-[#eb2630]/60 hover:text-[#eb2630] border-[#eb2630]/30 hover:bg-[#eb2630]/10'}`}
                      title="Invoke Devil's Advocate to critique the script"
                    >
                        <Gavel className="w-3 h-3" /> THE_CRITIC
                    </button>
                    <button 
                      onClick={() => { setMessages([]); setIsSadistMode(false); }}
                      className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-200"
                    >
                        <UserX className="w-3 h-3" /> BREAK
                    </button>
                </div>
            </div>

            {/* Cognitive / Piggybacked Visual Info */}
            {visualTags.length > 0 && (
                <div className="p-2 border-b border-gray-200 flex gap-2 flex-wrap items-center bg-blue-600/5">
                    <Activity className="w-3 h-3 text-blue-600" />
                    {visualTags.map(t => (
                        <span key={t} className="text-[8px] font-mono border border-blue-500/30 text-blue-600 px-1 bg-blue-600/10 uppercase tracking-wider">{t}</span>
                    ))}
                    <span className="ml-auto text-[8px] font-mono text-blue-600/60 uppercase">MOOD: {mood}</span>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center mt-10">
                        <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Awaiting Direct Query...</span>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {m.role === 'persona' && m.model && (
                            <span className="text-[8px] font-mono text-cyan-500 mb-1 flex items-center gap-1 opacity-70 uppercase">
                                <Zap className="w-2 h-2" /> {m.model}
                            </span>
                        )}
                        <div className={`max-w-[85%] p-3 text-[12px] font-arabic leading-relaxed ${m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-[#eb2630]/10 border border-[#eb2630]/30 text-[#eb2630]'}`}>
                            {m.role === 'persona' ? renderWithRedaction(m.text) : m.text}
                        </div>
                    </div>
                ))}
                {isInterrogating && (
                    <div className="flex justify-start">
                        <div className="p-3 border border-[#eb2630]/30 bg-[#eb2630]/5">
                            <span className="w-2 h-2 rounded-full bg-[#eb2630] animate-pulse inline-block"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                <input 
                    type="text" 
                    className="flex-1 bg-transparent border border-gray-200 text-gray-900 text-xs px-3 py-2 font-arabic focus:outline-none focus:border-[#eb2630]/50"
                    placeholder="وجه سؤالك المباشر للمصدر..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    dir="rtl"
                />
                <button onClick={handleSend} className="p-2 bg-[#eb2630]/20 hover:bg-[#eb2630]/40 text-[#eb2630] border border-[#eb2630]/30 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
