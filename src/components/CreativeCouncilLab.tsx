import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Fingerprint, Scissors, Palette, X, Sparkles, AlertCircle } from 'lucide-react';
import { executeCreativeCouncil, CouncilFeedback } from '../lib/gemini';
import { notify } from '../lib/notify';

interface CreativeCouncilLabProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
}

export const CreativeCouncilLab: React.FC<CreativeCouncilLabProps> = ({ isOpen, onClose, scriptText }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<CouncilFeedback | null>(null);

  const startCouncil = async () => {
    if (!scriptText || scriptText.trim().length < 50) {
      notify.breach('النص قصير جداً لبدء اجتماع الوكلاء.');
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);
    try {
      const result = await executeCreativeCouncil(scriptText, "gemini");
      setFeedback(result);
      notify.classified('تم انتهاء تقييم مجلس الوكلاء.');
    } catch (error: any) {
      notify.breach('حدث خطأ أثناء انعقاد المجلس الإبداعي.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const agentCards = feedback ? [
    {
      id: 'khafi',
      name: 'العميل خفي (KHAFI)',
      role: 'استخبارات وتشويق',
      icon: <Fingerprint className="w-5 h-5 text-purple-400" />,
      data: feedback.khafi,
      bg: 'bg-purple-900/10 border-purple-500/30'
    },
    {
      id: 'adala',
      name: 'العميل عدالة (ADALA)',
      role: 'هندسة الإيقاع',
      icon: <Scissors className="w-5 h-5 text-blue-400" />,
      data: feedback.adala,
      bg: 'bg-blue-900/10 border-blue-500/30'
    },
    {
      id: 'ain',
      name: 'العميل عين (AIN)',
      role: 'الإخراج البصري',
      icon: <Palette className="w-5 h-5 text-emerald-400" />,
      data: feedback.ain,
      bg: 'bg-emerald-900/10 border-emerald-500/30'
    }
  ] : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex justify-center items-center p-4 font-arabic" 
        dir="rtl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.95, opacity: 0 }} 
          className="bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-600 rounded-full blur-[100px]" />
          </div>

          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-800 relative z-10 backdrop-blur-sm bg-[#0a0a0a]/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-arabic text-white tracking-wide">مجلس الوكلاء الإبداعي <span className="text-xs text-red-500 border border-red-500/50 px-2 py-0.5 rounded-full ml-2">RESTRICTED</span></h2>
                <p className="text-gray-400 text-xs mt-1 font-mono tracking-wider">CREATIVE_COUNCIL // MULTI-AGENT SYNC</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            {!feedback && !isEvaluating && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                   <Sparkles className="w-16 h-16 text-blue-400 relative z-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">استدعاء مجلس الوكلاء</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                    سيقوم كل من (خفي، عدالة، عين) بقراءة اسكريبت الحلقة وتحليله بشكل نقدي في وقت واحد لتقديم تقييم شامل (إيقاع، تشويق، بصريات) قبل تصدير الحلقة النهائية.
                  </p>
                </div>
                <button 
                  onClick={startCouncil}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 text-white font-bold rounded-sm border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  بدء الجلسة النقدية
                </button>
              </div>
            )}

            {isEvaluating && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                <div className="relative flex justify-center items-center w-full max-w-md mx-auto h-32">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-32 h-32 border-t-2 border-l-2 border-purple-500 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-24 h-24 border-b-2 border-r-2 border-blue-500 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-16 h-16 border-t-2 border-emerald-500 rounded-full"
                  />
                  <Users className="w-6 h-6 text-white absolute z-10" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white animate-pulse">الوكلاء يقرأون الملفات...</h3>
                  <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Analyzing Narrative, Visual & Engagement Metrics</p>
                </div>
              </div>
            )}

            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overall Verdict */}
                <div className="bg-[#111] border border-gray-700/50 p-5 rounded-lg flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                  <div>
                    <h3 className="text-blue-400 text-sm font-bold mb-1 uppercase tracking-widest font-mono">القرار النهائي للمجلس</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">{feedback.overall_verdict}</p>
                  </div>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {agentCards.map((agent, i) => (
                    <motion.div 
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-5 rounded-lg border ${agent.bg} relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {agent.icon}
                          <div>
                            <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                            <span className="text-[10px] text-gray-400 block">{agent.role}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className={`text-2xl font-black font-mono block ${getScoreColor(agent.data.score)}`}>
                            {agent.data.score}/10
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <div className="bg-black/40 p-3 rounded text-xs text-gray-300 leading-relaxed border border-white/5">
                           <span className="text-[10px] text-gray-500 block mb-1 uppercase tracking-widest">الملاحظة النقدية:</span>
                           "{agent.data.comment}"
                         </div>
                         <div className="bg-white/5 p-3 rounded text-xs text-indigo-200 leading-relaxed border border-white/10">
                           <span className="text-[10px] text-indigo-400/70 block mb-1 uppercase tracking-widest">الفرمان (التوصية):</span>
                           {agent.data.recommendation}
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                   <button onClick={onClose} className="px-8 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded transition-colors uppercase tracking-widest font-mono">
                     Acknowledge & Close
                   </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
