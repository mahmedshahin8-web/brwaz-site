import React, { useState } from 'react';
import { generateAIContentRaw } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Sparkles, Wand2, Youtube, Type, MessageSquare, Loader2, Lock, Users, Mic2, FileText, Upload } from 'lucide-react';
import { notify } from '../lib/notify';

interface OllamaCreativeLabProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
}

export function OllamaCreativeLab({ isOpen, onClose, scriptText }: OllamaCreativeLabProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [localRagInput, setLocalRagInput] = useState('');

  if (!isOpen) return null;

  const tools = [
    { id: 'factcheck', label: 'رادار الحقائق', icon: <ShieldAlert size={16} />, desc: 'اكتشاف الإدعاءات التي تحتاج مصادر' },
    { id: 'devilsadvocate', label: 'محامي الشيطان', icon: <MessageSquare size={16} />, desc: 'كتابة نص مضاد لكشف الثغرات' },
    { id: 'privacy_shield', label: 'درع الخصوصية', icon: <Lock size={16} />, desc: 'إخفاء البيانات الحساسة (تعقيم محلي)' },
    { id: 'ai_debate', label: 'مناظرة المحركات', icon: <Users size={16} />, desc: 'Gemini vs Ollama - مناظرة نقدية' },
    { id: 'tone_modifier', label: 'هندسة النبرة', icon: <Mic2 size={16} />, desc: 'إعادة الكتابة بأساليب مختلفة' },
    { id: 'local_rag', label: 'التحليل السري', icon: <FileText size={16} />, desc: 'تحليل مستند محدد دون رفعه للسحابة' },
    { id: 'broll', label: 'مجاز بصري (B-Roll)', icon: <Wand2 size={16} />, desc: 'توليد استعارات بصرية إبداعية للسيناريو' },
    { id: 'director', label: 'نقد المخرج', icon: <Sparkles size={16} />, desc: 'تقييم الإيقاع والنبرة' },
    { id: 'thumbnail', label: 'صور مصغرة (Thumbnails)', icon: <Youtube size={16} />, desc: 'أفكار جذابة للصور المصغرة' },
    { id: 'titlegen', label: 'عناوين بديلة', icon: <Type size={16} />, desc: 'توليد 5 عناوين فيروسية للسيناريو' }
  ];

  const runTool = async (toolId: string) => {
    setActiveTab(toolId);
    setResult('');
    
    if (toolId === 'local_rag') {
       return; // Wait for user input
    }
    
    if (!scriptText.trim()) {
      notify.breach('السيناريو فارغ! يرجى كتابة نص اولاً.');
      return;
    }
    
    setIsLoading(true);
    try {
      let prompt = '';
      const { Type } = await import('../lib/gemini');

      if (toolId === 'ai_debate') {
          setResult('🟡 [PROCESSING] جاري إجراء النقد عبر المحرك السحابي (Gemini)...\n');
          const geminiPrompt = `Analyze the following script and provide a constructive critique pointing out its weak points or areas lacking evidence. Respond in Arabic. Script:\n${scriptText}`;
          const geminiResp = await generateAIContentRaw(geminiPrompt, { type: Type.STRING }, 'gemini');
          setResult(`🔴 [العقل السحابي - النقد]:\n${geminiResp}\n\n🟢 [PROCESSING] جاري بناء الدفاع عبر المحرك المحلي (Ollama)...`);
          
          const ollamaPrompt = `You are a fierce defender of the original script. A cloud-based AI critic just challenged the script with the following points:\n"${geminiResp}"\n\nWrite a strong rebuttal defending the script against these points. Use the script text as context:\n${scriptText}\n\nRespond in Arabic.`;
          const ollamaResp = await generateAIContentRaw(ollamaPrompt, { type: Type.STRING }, 'ollama');
          
          setResult(`🔴 **[العقل السحابي - النقد والتفكيك]**:\n${geminiResp}\n\n🟢 **[المحرك المحلي - الدفاع والتفنيد]**:\n${ollamaResp}`);
          setIsLoading(false);
          return;
      }

      switch (toolId) {
        case 'factcheck':
          prompt = `Analyze the following script and extract bold claims or facts that might need citation. Format as a bulleted list. Script:\n${scriptText}`;
          break;
        case 'devilsadvocate':
          prompt = `Read the following script and write a short "Devil's Advocate" counter-script that challenges its main points. Respond in Arabic. Script:\n${scriptText}`;
          break;
        case 'privacy_shield':
          prompt = `You are a Local Privacy Sanitizer. Read the following text and replace ANY names of real people, companies, sensitive locations, or identifying numbers with [REDACTED]. Return ONLY the sanitized text. Text:\n${scriptText}`;
          break;
        case 'tone_modifier':
          prompt = `Rewrite the following script snippet in 3 different tones:
1. Highly Sarcastic (ساخر جداً)
2. Overly Dramatic/Cinematic (درامي سينمائي)
3. Academic/Neutral (أكاديمي محايد)
Respond in Arabic. Script:\n${scriptText}`;
          break;
        case 'broll':
          prompt = `Suggest highly creative, metaphorical B-Roll ideas (visuals) for the key moments in this script. Do not suggest literal visuals. Format as a list. Script:\n${scriptText}`;
          break;
        case 'director':
          prompt = `As a professional video director, critique the pacing, tone, and emotional arc of this script. Give actionable advice for recording. Respond in Arabic. Script:\n${scriptText}`;
          break;
        case 'thumbnail':
          prompt = `Suggest 3 high-CTR YouTube thumbnail concepts for this script. Describe the foreground, background, and text overlay for each. Respond in Arabic. Script:\n${scriptText}`;
          break;
        case 'titlegen':
          prompt = `Generate 5 viral, click-worthy YouTube titles for this script in Arabic. They should not be clickbait, but very engaging. Script:\n${scriptText}`;
          break;
      }

      const text = await generateAIContentRaw(prompt, { type: Type.STRING }, 'ollama');
      setResult(text);
    } catch (err: any) {
      console.error(err);
      notify.breach('فشل توليد الاستجابة من Ollama.');
      setResult("حدث خطأ في الاتصال بالمحرك المحلي. يرجى التأكد من تشغيل Ollama.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeLocalRag = async () => {
     if (!localRagInput.trim()) return notify.breach("الرجاء إدخال النص السري أولاً.");
     setIsLoading(true);
     setResult('');
     try {
       const { Type } = await import('../lib/gemini');
       const prompt = `You are a local secure data analyzer. Analyze this secret document and generate a top-secret summary with key bullet points. It must never leave the local environment. Text:\n${localRagInput}\n\nRespond in Arabic.`;
       const text = await generateAIContentRaw(prompt, { type: Type.STRING }, 'ollama');
       setResult(text);
     } catch (err) {
       console.error(err);
       notify.breach('فشل في تحليل المرفقات محلياً.');
       setResult("حدث خطأ أثناء الاتصال بالمحرك المحلي.");
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[85vh] h-full bg-white border border-gray-200 shadow-2xl flex flex-col font-sans overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#fafafa] shrink-0">
            <div className="flex items-center gap-3 text-gray-900">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold font-arabic">أدوات Ollama الإبداعية ودرع الخصوصية</h2>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">LOCAL_AI</span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-l border-gray-100 bg-[#fafafa] flex flex-col overflow-y-auto sink-0">
              <div className="p-4 space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mb-4 px-2">LOCAL_TOOLS</p>
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => runTool(tool.id)}
                    className={`w-full flex flex-col items-start gap-1 p-3 text-right transition-colors duration-100 ${activeTab === tool.id ? 'bg-white border text-emerald-600 border-emerald-200 shadow-sm' : 'border-transparent text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm font-arabic">
                      {tool.icon}
                      {tool.label}
                    </div>
                    <span className="text-[10px] text-gray-500 pr-6 block">{tool.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col">
              {!activeTab && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Wand2 size={48} className="mb-4 opacity-50" />
                  <p className="font-arabic text-lg">اختر أداة من القائمة لاستخدام الذكاء الاصطناعي المحلي القوي</p>
                </div>
              )}

              {activeTab === 'local_rag' && !isLoading && !result && (
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center gap-2 text-gray-900 border-b pb-4">
                     <FileText className="w-6 h-6 text-emerald-500" />
                     <div>
                       <h3 className="font-bold text-lg font-arabic">التحليل السري (Local RAG)</h3>
                       <p className="text-xs text-gray-500 font-mono">100% PRIVATE EVALUATION. NO CLOUD UPLOADS.</p>
                     </div>
                  </div>
                  <textarea 
                     value={localRagInput}
                     onChange={(e) => setLocalRagInput(e.target.value)}
                     className="w-full flex-1 border border-emerald-200/50 bg-emerald-50/10 p-4 text-sm font-arabic focus:outline-none focus:border-emerald-400 resize-none"
                     placeholder="قم بلصق المستندات السرية، وثائق ويكيليكس، أو الأبحاث الخاصة هنا..."
                  />
                  <button onClick={executeLocalRag} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all font-mono text-[11px] font-bold tracking-widest uppercase">
                     <Upload className="w-4 h-4" />
                     RUN_LOCAL_ANALYSIS
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-emerald-600">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p className="font-arabic font-bold text-sm mb-2">جاري المعالجة (AI Engine)...</p>
                  <p className="text-[10px] font-mono text-gray-500 max-w-sm text-center">PLEASE_WAIT_WHILE_ENGINE_PROCESSES</p>
                  {result && (
                     <div className="mt-8 text-xs font-arabic text-gray-600 bg-gray-50 p-4 border w-full max-w-lg whitespace-pre-wrap rounded tracking-wide leading-relaxed shadow-inner">
                        {result}
                     </div>
                  )}
                </div>
              )}

              {!isLoading && activeTab && result && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 flex-shrink-0">
                    <h3 className="font-bold text-lg text-gray-900 font-arabic border-r-4 border-emerald-500 pr-3">نتائج المعالجة</h3>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1">LOCAL_ENGINE</span>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-100 p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-arabic">
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
