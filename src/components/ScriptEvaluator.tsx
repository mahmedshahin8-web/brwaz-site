import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldCheck, Zap, Scissors, Award, Compass, Search, Wand2 } from 'lucide-react';
import { evaluateScriptQuality, ScriptEvaluation, autoRefineScript } from '../lib/gemini';
import { notify } from '../lib/notify';

interface Props {
  script: string;
  engine: string;
  onRefined?: (newScript: string) => void;
}

export const ScriptEvaluator: React.FC<Props> = ({ script, engine, onRefined }) => {
  const [evaluation, setEvaluation] = useState<ScriptEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const handleEvaluate = async () => {
    if (!script || script.length < 50) {
       notify.breach('السكريبت قصير جداً للتقييم');
       return;
    }
    setIsEvaluating(true);
    try {
      const result = await evaluateScriptQuality(script, engine);
      setEvaluation(result);
      notify.classified('تم تحليل السكريبت وتقييمه بنجاح');
    } catch (err) {
      notify.breach('حدث خطأ أثناء التقييم');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAutoRefine = async () => {
    if (!evaluation || !onRefined) return;
    setIsRefining(true);
    notify.classified('جارٍ تفعيل المونتاج السحري وإعادة صياغة السكريبت...');
    try {
      const newScript = await autoRefineScript(script, evaluation.actionable_tips, engine);
      onRefined(newScript);
      notify.classified('تم تحديث السكريبت بناءً على نصائح التقييم');
      setEvaluation(null); // Reset evaluation for the new script
    } catch (err) {
      notify.breach('حدث خطأ أثناء التحسين التلقائي');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-[#121214]/80 border border-[#10b981]/50 p-6 rounded-2xl mb-8 relative overflow-hidden  shadow-[0_0_30px_rgba(31,90,94,0.1)]">
       <div className="absolute top-0 right-0 p-4 opacity-10">
         <ShieldCheck size={120} />
       </div>
       
       <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
         <div>
            <h3 className="text-xl font-bold text-[#fafafa] font-arabic mb-1 flex items-center gap-2">
              <Activity className="text-[#10b981]" size={20} />
              مقياس جودة السرد (Narrative AI Grader)
            </h3>
            <p className="text-sm text-[#a1a1aa] font-arabic">
              يقرأ الذكاء الاصطناعي السكريبت ويقيم مدى قوة الخطاف وفرصة الاحتفاظ بالمشاهد (Retention).
            </p>
         </div>
         
         <button
           onClick={handleEvaluate}
           disabled={isEvaluating || isRefining}
           className="bg-[#10b981] hover:bg-[#164346] text-[#fafafa] px-5 py-3 rounded-xl font-bold font-arabic active:scale-95 transition-all outline-none border border-[#10b981]/50 shadow-sm flex items-center justify-center gap-2"
         >
           {isEvaluating ? (
             <>
               <Compass size={18} className="animate-spin" />
               جاري التحليل...
             </>
           ) : (
             <>
               <Search size={18} />
               تقييم السكريبت
             </>
           )}
         </button>
       </div>

       <AnimatePresence>
         {evaluation && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="overflow-hidden"
           >
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 border-t border-[#27272a] pt-6">
                
                {/* Score */}
                <div className="col-span-1 flex flex-col items-center justify-center bg-[#09090b]/80 p-6 rounded-xl border border-[#10b981]/50 shadow-sm">
                   <div className="text-5xl font-arabic text-[#4ade80] font-black tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                     {evaluation.score}<span className="text-xl text-[#71717a]">/100</span>
                   </div>
                   <span className="text-[10px]  font-arabic  text-[#a1a1aa] font-bold">الدرجة الشاملة</span>
                </div>

                {/* Metrics */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                     <span className="flex items-center gap-2 text-xs font-bold text-[#6366f1] mb-2  tracking-wide">
                        <Zap size={14} /> Hook Strength
                     </span>
                     <p className="text-sm text-[#fafafa] font-arabic">{evaluation.hook_strength}</p>
                   </div>
                   <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                     <span className="flex items-center gap-2 text-xs font-bold text-[#4ade80] mb-2  tracking-wide">
                        <Activity size={14} /> Retention Predict
                     </span>
                     <p className="text-sm text-[#fafafa] font-arabic">{evaluation.retention_prediction}</p>
                   </div>
                   <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                     <span className="flex items-center gap-2 text-xs font-bold text-[#f87171] mb-2  tracking-wide">
                        <Scissors size={14} /> Fluff Index
                     </span>
                     <p className="text-sm text-[#fafafa] font-arabic">{evaluation.fluff_index}</p>
                   </div>
                </div>

                {/* Tips */}
                <div className="col-span-1 md:col-span-4 bg-[#10b981]/10 p-5 rounded-xl border border-[#10b981]/30 mt-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="flex items-center gap-2 text-[#10b981] text-sm font-bold  tracking-wider font-arabic">
                      <Award size={16} /> Actionable Tips (نصائح ذهبية)
                    </h4>
                    
                    {onRefined && (
                      <button 
                        onClick={handleAutoRefine}
                        disabled={isRefining}
                        className="bg-[#4f46e5] hover:bg-[#6366f1] text-[#121214] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95"
                      >
                        {isRefining ? <Compass size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        تطبيق المونتاج السحري (Auto-Refine)
                      </button>
                    )}
                  </div>
                  <ul className="space-y-2">
                     {evaluation.actionable_tips.map((tip, idx) => (
                       <li key={idx} className="text-[#e5e3e0] text-sm font-arabic flex items-start gap-2">
                         <span className="text-[#10b981] mt-1 -ml-1">•</span> {tip}
                       </li>
                     ))}
                  </ul>
                </div>

             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};
