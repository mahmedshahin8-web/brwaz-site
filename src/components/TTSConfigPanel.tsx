import React, { useState, useEffect } from 'react';
import { Volume2, Server, Save, Activity } from 'lucide-react';
import { TTSConfig, getTTSConfig, saveTTSConfig, generateAndPlayTTS } from '../services/ttsService';

export const TTSConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<TTSConfig>(getTTSConfig());
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    saveTTSConfig(config);
  }, [config]);

  const handleSave = () => {
    saveTTSConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (config.engine === 'browser') return;
    setIsTesting(true);
    setTestResult(null);
    try {
       await generateAndPlayTTS("تجربة الاتصال بسيرفر الصوت", () => setIsTesting(false));
       setTestResult('success');
    } catch(e) {
       setTestResult('error');
       setIsTesting(false);
    }
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Server size={14} className="text-amber-500" />
        <h3 className="text-sm font-medium text-amber-500 tracking-wider">Local TTS Configuration</h3>
      </div>
      
      <p className="text-xs text-zinc-500 leading-relaxed">
        Connect to a local Text-to-Speech server for high quality voice synthesis. <br/>
        Supported: <strong>OpenAI-Compatible</strong> (e.g., F5-TTS, LocalAI, Kokoro) and <strong>XTTS v2 API</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-500 font-mono">Engine Type</label>
          <select 
            value={config.engine}
            onChange={(e) => setConfig({ ...config, engine: e.target.value as TTSConfig['engine'] })}
            className="w-full bg-black text-xs p-2 border border-zinc-800 focus:outline-none focus:border-amber-500 text-zinc-300"
          >
            <option value="browser">Browser Native (Standard / Fallback)</option>
            <option value="openai">OpenAI Compatible API (F5-TTS, LocalAI)</option>
            <option value="xtts">XTTS API (Coqui)</option>
          </select>
        </div>

        {config.engine !== 'browser' && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500 font-mono">API URL Endpoint</label>
            <input 
              type="text"
              value={config.apiUrl}
              onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
              placeholder={config.engine === 'openai' ? 'https://your-url.ngrok-free.app/v1/audio/speech' : 'https://your-url.ngrok-free.app/api/tts'}
              className="w-full bg-black text-xs p-2 border border-zinc-800 focus:outline-none focus:border-amber-500 text-zinc-300 font-mono"
            />
          </div>
        )}
      </div>

       {config.engine !== 'browser' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500 font-mono">Voice ID / Speaker (Optional)</label>
            <input 
              type="text"
              value={config.voiceId || ''}
              onChange={(e) => setConfig({ ...config, voiceId: e.target.value })}
              placeholder="e.g. alloy, or path_to_speaker.wav"
              className="w-full bg-black text-xs p-2 border border-zinc-800 focus:outline-none focus:border-amber-500 text-zinc-300 font-mono"
            />
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center justify-end gap-2">
        {config.engine !== 'browser' && (
          <button 
            onClick={handleTestConnection}
            disabled={isTesting}
            className={`flex items-center gap-2 p-2 text-xs border transition-colors ${
              testResult === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
              testResult === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
              'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30'
            }`}
          >
            <Activity size={12} className={isTesting ? "animate-pulse" : ""} />
            {isTesting ? "جاري التجربة..." : 
             testResult === 'success' ? "نجاح الاتصال" : 
             testResult === 'error' ? "خطأ في الاتصال" : "تجربة الاتصال"}
          </button>
        )}
         <button 
          onClick={handleSave}
          className="flex items-center gap-2 p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs border border-amber-500/30 transition-colors"
        >
          <Save size={12} />
          {isSaved ? "Saved!" : "Save Configuration"}
        </button>
      </div>

      {config.engine !== 'browser' && (
        <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 text-xs text-blue-300 space-y-2">
           <p><strong>💡 نصيحة للربط (Ngrok):</strong> بما أنك تستخدم Ngrok لربط Ollama، ستحتاج لعمل نفس الشيء لبرنامج الصوت. قم بتشغيل سيرفر الصوت (مثل F5-TTS) على جهازك، ثم افتح بورت جديد في Ngrok وضع الرابط هنا.</p>
           <p className="text-amber-500/80 border-t border-blue-900/30 pt-2">
             <strong>⚠️ سحب الموارد (VRAM):</strong> لا تقلق، الموديل الخاص بالكتابة (Ollama/Gemma) سيعمل أولاً لإنهاء السكريبت، وعندما تضغط على "توليد الصوت" سيكون Ollama في وضع السكون، وبالتالي البرنامج الصوتي سيأخذ مساحته بحرية دون أن "يعلق" جهازك.
           </p>
        </div>
      )}
    </div>
  );
};
