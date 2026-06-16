import React from "react";
import { X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useOllama: boolean;
  setUseOllama: (val: boolean) => void;
  ollamaUrl: string;
  setOllamaUrl: (val: string) => void;
  ollamaModel: string;
  setOllamaModel: (val: string) => void;
  isTagTeam: boolean;
  setIsTagTeam: (val: boolean) => void;
  isQuotaShield: boolean;
  setIsQuotaShield: (val: boolean) => void;
  elevenLabsKey: string;
  setElevenLabsKey: (val: string) => void;
  elevenLabsVoiceId: string;
  setElevenLabsVoiceId: (val: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  useOllama,
  setUseOllama,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  isTagTeam,
  setIsTagTeam,
  isQuotaShield,
  setIsQuotaShield,
  elevenLabsKey,
  setElevenLabsKey,
  elevenLabsVoiceId,
  setElevenLabsVoiceId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#121214] /80 "
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-[#27272a]/50 border border-[#27272a] p-8 shadow-2xl space-y-8 no-scrollbar overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center border-b border-[#27272a] pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4f46e5]/10 text-[#4f46e5]">
              <Settings size={20} />
            </div>
            <h3 className="text-xl font-arabic font-black text-[#fafafa]">إعدادات المحرك (Engine Settings)</h3>
          </div>
          <button onClick={onClose} className="text-[#71717a] active:scale-95 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
            <div className="space-y-1">
              <span className="text-sm font-arabic text-[#fafafa]">استخدام Ollama محلياً</span>
              <p className="text-[10px] text-[#71717a] font-arabic">CONNECT_TO_LOCAL_AI_ENGINE</p>
            </div>
            <button 
              onClick={() => setUseOllama(!useOllama)}
              className={`w-12 h-6 rounded-full transition-all relative ${useOllama ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#121214]  transition-all ${useOllama ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <AnimatePresence>
            {useOllama && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-[#27272a] overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa]  ">Ollama_Endpoint_URL</label>
                  <input 
                    type="text" 
                    value={ollamaUrl} 
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa]  ">AI_Model_Target</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["gemma4:31b-cloud", "gemma2:9b-instruct-q4_0", "llama3:8b", "mistral"].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setOllamaModel(m)}
                        className={`px-2 py-1 text-[9px] font-arabic border transition-all ${ollamaModel === m ? 'bg-[#4f46e5] border-[#4f46e5] text-black' : 'bg-[#121214]  border-[#27272a] shadow-sm border-[#27272a] text-[#a1a1aa] active:scale-95'}`}
                      >
                        {m.includes('cloud') ? '🌩️ ' + m.split(':')[0] : m.split(':')[0]}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={ollamaModel} 
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                    placeholder="e.g. gemma2:9b-instruct-q4_0"
                  />
                  <p className="text-[9px] text-[#4f46e5]/50 italic">Recommended: gemma4:31b-cloud</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 pt-6 border-t border-[#27272a]">
            <h4 className="text-[10px] font-arabic text-[#a1a1aa]  ">Multi-Engine Protocols</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
                <div className="space-y-1">
                  <span className="text-[11px] font-arabic text-[#fafafa]">نظام التوزيع الذكي (Tag-Team)</span>
                  <p className="text-[9px] text-[#71717a] font-arabic">GEMINI_RESEARCH + OLLAMA_DRAFTING</p>
                </div>
                <button 
                  onClick={() => setIsTagTeam(!isTagTeam)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isTagTeam ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121214]  transition-all ${isTagTeam ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
                <div className="space-y-1">
                  <span className="text-[11px] font-arabic text-[#fafafa]">درع الرصيد (Quota Shield)</span>
                  <p className="text-[9px] text-[#71717a] font-arabic">AUTO_FAILOVER_TO_OLLAMA_ON_GEMINI_LIMIT</p>
                </div>
                <button 
                  onClick={() => setIsQuotaShield(!isQuotaShield)}
                  className={`w-10 h-5 rounded-full transition-all relative ${isQuotaShield ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121214]  transition-all ${isQuotaShield ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#27272a]">
            <h4 className="text-[10px] font-arabic text-[#a1a1aa]  ">External_Voice_Engines</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-arabic text-[#a1a1aa]  ">ElevenLabs_API_Key</label>
                <input 
                  type="password" 
                  value={elevenLabsKey} 
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                  className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                  placeholder="sk_..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-arabic text-[#a1a1aa]  ">ElevenLabs_Voice_ID</label>
                <input 
                  type="text" 
                  value={elevenLabsVoiceId} 
                  onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                  className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#4f46e5] text-black font-arabic font-bold text-lg active:scale-95 transition-all shadow-deep shadow-blue-500/10"
        >
          حفظ التغييرات (Save_Configuration)
        </button>
      </motion.div>
    </div>
  );
};
