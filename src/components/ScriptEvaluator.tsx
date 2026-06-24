import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Scissors, 
  Award, 
  Compass, 
  Search, 
  Wand2, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  BadgeAlert, 
  RefreshCw,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  evaluateScriptQuality, 
  ScriptEvaluation, 
  autoRefineScript, 
  evaluateFullDeliverablesQuality, 
  executeUniversalAutoFix, 
  DeliverableIssue, 
  UniversalEvaluationResult 
} from '../lib/gemini';
import { useCreatorStore } from '../store/useCreatorStore';
import { notify } from '../lib/notify';

interface Props {
  script: string;
  engine: string;
  onRefined?: (newScript: string) => void;
}

export const ScriptEvaluator: React.FC<Props> = ({ script, engine, onRefined }) => {
  const { data, setData, finalVoiceScript, setFinalVoiceScript } = useCreatorStore();
  
  // Legacy script evaluation state
  const [evaluation, setEvaluation] = useState<ScriptEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // New multi-file compliance states
  const [activeTab, setActiveTab] = useState<'deliverables' | 'script'>('deliverables');
  const [qualityResult, setQualityResult] = useState<UniversalEvaluationResult | null>(null);
  const [isGuarding, setIsGuarding] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);

  // Sound play click helper (fallback if hook not active in context)
  const playClick = () => {
    try {
      const audio = new Audio('/sounds/click.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const playSuccess = () => {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // 1. Classical script evaluation
  const handleEvaluateLegacy = async () => {
    if (!script || script.length < 50) {
       notify.breach('السكريبت قصير جداً للتقييم');
       return;
    }
    setIsEvaluating(true);
    playClick();
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

  const handleAutoRefineLegacy = async () => {
    if (!evaluation || !onRefined) return;
    setIsRefining(true);
    playClick();
    notify.classified('جارٍ تفعيل المونتاج السحري وإعادة صياغة السكريبت...');
    try {
      const newScript = await autoRefineScript(script, evaluation.actionable_tips, engine);
      onRefined(newScript);
      notify.classified('تم تحديث السكريبت بناءً على نصائح التقييم');
      setEvaluation(null);
    } catch (err) {
      notify.breach('حدث خطأ أثناء التحسين التلقائي');
    } finally {
      setIsRefining(false);
    }
  };

  // 2. Comprehensive Quality & Fact Guard
  const handleRunDeliverablesGuard = async () => {
    if (!data) {
      notify.breach('لا توجد بيانات أو ملفات نشطة حالياً لفحصها');
      return;
    }
    
    setIsGuarding(true);
    playClick();
    notify.classified('تم إرسال كافة ملفات النشر والمخطط وكتابة الحركة للفحص الشامل...');

    const metadata = {
      title: data.video_title || "وثائقية غير معنونة",
      description: data.publishing_kit?.description || "",
      tags: data.publishing_kit?.tags || []
    };

    const scenesFormatted = [
      {
        title: data.opening_sketch?.title || "مقدمة المشهد",
        voice_over: data.opening_sketch?.voice_over || "",
        visual_instructions: data.opening_sketch?.visual_instructions || ""
      },
      ...(data.scenes || []).map((s: any) => ({
        title: s.title || "مشهد فرعي",
        voice_over: s.voice_over || "",
        visual_instructions: s.visual_instructions || ""
      }))
    ];

    try {
      const result = await evaluateFullDeliverablesQuality(
        finalVoiceScript || script,
        metadata,
        scenesFormatted,
        engine
      );
      setQualityResult(result);
      // Select all issues by default
      if (result.issues) {
        setSelectedIssueIds(result.issues.map(issue => issue.id));
      }
      notify.classified('اكتمل فحص الملفات! تم رصد نقاط الهلوسة والتكرار بنجاح.');
      playSuccess();
    } catch (e) {
      notify.breach('فشل رادار التدقيق الشامل في تمشيط الملفات.');
    } finally {
      setIsGuarding(false);
    }
  };

  const toggleIssueSelection = (id: string) => {
    playClick();
    if (selectedIssueIds.includes(id)) {
      setSelectedIssueIds(selectedIssueIds.filter(x => x !== id));
    } else {
      setSelectedIssueIds([...selectedIssueIds, id]);
    }
  };

  const handleApplyCleansingFix = async () => {
    if (!qualityResult || !data) return;
    
    const issuesToFix = qualityResult.issues.filter(issue => selectedIssueIds.includes(issue.id));
    if (issuesToFix.length === 0) {
      notify.breach('يرجى تحديد مشكلة واحدة على الأقل لإصلاحها');
      return;
    }

    setIsFixing(true);
    playClick();
    notify.classified('بدأ إصلاح الهلوسة والترهل وتطهير كافة الملفات بنقرة واحدة...');

    const metadata = {
      title: data.video_title || "",
      description: data.publishing_kit?.description || "",
      tags: data.publishing_kit?.tags || []
    };

    const scenesFormatted = [
      {
        title: data.opening_sketch?.title || "المشهد الافتتاحي",
        voice_over: data.opening_sketch?.voice_over || "",
        visual_instructions: data.opening_sketch?.visual_instructions || ""
      },
      ...(data.scenes || []).map((s: any) => ({
        title: s.title || "مشهد",
        voice_over: s.voice_over || "",
        visual_instructions: s.visual_instructions || ""
      }))
    ];

    try {
      const fixResult = await executeUniversalAutoFix(
        finalVoiceScript || script,
        metadata,
        scenesFormatted,
        issuesToFix,
        engine
      );

      // 1. Update Voice Script State
      if (fixResult.corrected_script) {
        setFinalVoiceScript(fixResult.corrected_script);
        if (onRefined) {
          onRefined(fixResult.corrected_script);
        }
      }

      // 2. Update scenes and publishing kit in global store
      const updatedOpening = {
        ...data.opening_sketch,
        title: fixResult.corrected_scenes[0]?.title || data.opening_sketch?.title,
        voice_over: fixResult.corrected_scenes[0]?.voice_over || data.opening_sketch?.voice_over,
        visual_instructions: fixResult.corrected_scenes[0]?.visual_instructions || data.opening_sketch?.visual_instructions
      };

      const updatedScenes = (data.scenes || []).map((scene: any, idx: number) => {
        const corrected = fixResult.corrected_scenes[idx + 1]; // index 0 is opening
        if (corrected) {
          return {
            ...scene,
            title: corrected.title,
            voice_over: corrected.voice_over,
            visual_instructions: corrected.visual_instructions
          };
        }
        return scene;
      });

      const updatedData = {
        ...data,
        video_title: fixResult.corrected_metadata.title,
        opening_sketch: updatedOpening,
        scenes: updatedScenes,
        publishing_kit: {
          ...data.publishing_kit,
          youtube_titles: [
            fixResult.corrected_metadata.title, 
            ...(data.publishing_kit?.youtube_titles?.filter((t: string) => t !== data.video_title) || [])
          ],
          description: fixResult.corrected_metadata.description,
          tags: fixResult.corrected_metadata.tags
        }
      };

      setData(updatedData);

      notify.classified('يا للهول! تم تطهير كافة الملفات وعلاج الهلوسة والتكرار بنجاح تام ✨');
      setQualityResult(null); // Clear result after fixing
      playSuccess();
    } catch (e) {
      notify.breach('فشلت عملية الإصلاح التلقائي للملفات.');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-[#121214]/90 border border-[#1e293b] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all mb-8">
      {/* Absolute Glow Backgrounds */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4f46e5]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#27272a]/70 pb-6 relative z-10">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#fafafa] font-arabic flex items-center gap-3">
            <ShieldCheck className="text-amber-500 animate-pulse" size={26} />
            رادار التدقيق والجودة الشامل (Pro Quality Radar)
          </h2>
          <p className="text-xs md:text-sm text-[#71717a] font-arabic mt-1">
            نظام متقدم لمسح وتطهير مخرجات النشر من الهلوسة وحشو المعلومات وتكرار الأفكار بنقرة واحدة.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-[#0b0f17] p-1 border border-[#27272a] rounded-xl self-end md:self-auto">
          <button
            onClick={() => { setActiveTab('deliverables'); playClick(); }}
            className={`px-4 py-2 rounded-lg text-xs font-arabic font-extrabold transition-all relative ${
              activeTab === 'deliverables' 
                ? 'bg-[#4f46e5] text-white shadow-sm' 
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            حارس الملفات المزدوج {qualityResult && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-ping" />}
          </button>
          <button
            onClick={() => { setActiveTab('script'); playClick(); }}
            className={`px-4 py-2 rounded-lg text-xs font-arabic font-bold transition-all ${
              activeTab === 'script' 
                ? 'bg-[#4f46e5] text-white shadow-sm' 
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            تحليل نبرة الفأرة / السرد
          </button>
        </div>
      </div>

      {activeTab === 'deliverables' ? (
        <div className="space-y-6 relative z-10" dir="rtl">
          {!qualityResult && !isGuarding && (
            <div className="text-center py-10 px-6 bg-[#0b0f17]/50 rounded-2xl border border-[#27272a]/50 border-dashed space-y-4">
              <Compass size={40} className="mx-auto text-[#71717a] animate-spin" style={{ animationDuration: '8s' }} />
              <div className="space-y-2">
                <h4 className="text-base font-bold text-[#fafafa] font-arabic">لا توجد نتائج مسح حالية للبرواز</h4>
                <p className="text-xs text-[#71717a] font-arabic max-w-lg mx-auto leading-relaxed">
                  يقوم الرادار بفحص النص الرئيسي وعناصر السيناريو البصرية، بالإضافة لعناوين يوتيوب وعلامات النشر لضمان خلوها تماماً من أي جمل مكررة، أو معلومات مغلوطة مضللة.
                </p>
              </div>
              <button
                onClick={handleRunDeliverablesGuard}
                className="mx-auto mt-2 px-10 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-arabic font-extrabold text-sm rounded-xl transition-all duration-300 active:scale-95 shadow-md flex items-center gap-2 justify-center"
              >
                <Search size={16} />
                بدء تمشيط وتدقيق كافة الملفات والسكريبت
              </button>
            </div>
          )}

          {isGuarding && (
            <div className="text-center py-16 space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-indigo-500 border-l-transparent"
                />
                <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#fafafa] animate-pulse" size={32} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-lg font-bold text-amber-400 font-arabic">جاري التشريح التكتيكي وتطهير الملفات...</h4>
                <p className="text-xs text-[#71717a] font-arabic animate-pulse">
                  يقوم وكيل محامي الشيطان بتمشيط الفويس أوفر، العناوين، وبصريات المشهد لمطابقة الحقائق واصطياد الهلووسة...
                </p>
              </div>
            </div>
          )}

          {qualityResult && !isGuarding && (
            <div className="space-y-6">
              {/* Score Dashboard Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0b0f17] p-5 rounded-2xl border border-amber-500/20">
                <div className="md:col-span-1 flex flex-col justify-center items-center p-4 bg-[#121214] rounded-xl border border-amber-500/20">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider font-extrabold mb-1">التقييم الكلي للنزاهة</span>
                  <div className="text-4xl font-mono text-amber-400 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    {qualityResult.score}<span className="text-sm text-gray-500">/100</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-arabic text-[#71717a]">رتبة تطهير الملفات:</span>
                    <span className="text-xs font-arabic font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      {qualityResult.cleanliness_rating}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] font-arabic leading-relaxed">
                    تم رصد عدد ({qualityResult.issues.length}) ملاحظة بين تكرار جمل مألوفة وهلوسات ثانوية وتناقض تفاصيل البصريات مع سكريبت المعلق الصوتي.
                  </p>
                </div>

                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    onClick={handleApplyCleansingFix}
                    disabled={isFixing || selectedIssueIds.length === 0}
                    className="w-full h-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black font-extrabold font-arabic text-sm rounded-xl transition-all duration-300 transform active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.2)] flex items-center gap-2 justify-center"
                  >
                    {isFixing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        جاري التطهير...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        تطهير وإصلاح الملفات ({selectedIssueIds.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loader during fixing */}
              {isFixing && (
                <div className="p-8 bg-[#0b0f17]/80 rounded-2xl border border-emerald-500/35 relative overflow-hidden animate-pulse">
                  <div className="flex items-start gap-4" dir="rtl">
                    <RefreshCw className="text-emerald-400 animate-spin shrink-0 mt-1" size={24} />
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-emerald-400 font-arabic">عملية تطهير جراحية للمشاهد والملفات قيد المعالجة...</h4>
                      <p className="text-xs text-[#a1a1aa] leading-relaxed font-arabic">
                        يرجى الانتظار، جاري إعادة صياغة النصوص لإزالة الحشو اللغوي والتكرار، وحقن الحقائق المنقحة في كتابة المشاهد والأرشيف لتحديث ملفات التحميل تلقائيًا.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* List of issues */}
              <div className="space-y-4 font-arabic">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-[#fafafa]">تفاصيل ملف الأخطاء والقصور المكتشفة:</span>
                  <button 
                    onClick={() => {
                      playClick();
                      if (selectedIssueIds.length === qualityResult.issues.length) {
                        setSelectedIssueIds([]);
                      } else {
                        setSelectedIssueIds(qualityResult.issues.map(i => i.id));
                      }
                    }}
                    className="text-[10px] font-mono text-[#a1a1aa] hover:text-[#fafafa]"
                  >
                    {selectedIssueIds.length === qualityResult.issues.length ? "[إلغاء تحديد الكل]" : "[تحديد الكل]"}
                  </button>
                </div>

                {qualityResult.issues.length === 0 ? (
                  <div className="p-10 text-center bg-emerald-950/10 border border-emerald-500/30 rounded-2xl space-y-2">
                    <CheckCircle className="text-emerald-400 mx-auto" size={32} />
                    <p className="text-sm font-arabic font-bold text-[#fafafa]">تهانينا! الملفات نقية 100% ولا تحتوي على هلوسات أو تكرار.</p>
                  </div>
                ) : (
                  qualityResult.issues.map((issue) => {
                    const isSelected = selectedIssueIds.includes(issue.id);
                    return (
                      <div
                        key={issue.id}
                        onClick={() => toggleIssueSelection(issue.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none ${
                          isSelected 
                            ? "bg-[#111722]/50 border-amber-500/50 shadow-md translate-x-1" 
                            : "bg-[#0b0f17]/40 border-[#27272a]/70 hover:border-amber-500/20"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div click
                            className="w-4 h-4 rounded mt-1 border-gray-600 text-amber-500 focus:ring-0 focus:ring-offset-0 pointer-events-none"
                          />

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Severity Badge */}
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                issue.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-indigo-500/10 text-indigo-400'
                              }`}>
                                {issue.severity === 'high' ? 'حرجة' : issue.severity === 'medium' ? 'متوسطة' : 'بسيطة'}
                              </span>

                              {/* Category Badge */}
                              <span className="text-[10px] font-extrabold text-[#71717a] font-mono">
                                // {issue.category_ar}
                              </span>

                              {/* Target Badge */}
                              <span className="text-[9px] font-mono text-[#a1a1aa] bg-[#1a1c23] px-2 py-0.5 rounded border border-[#27272a]">
                                النطاق المتأثر: {
                                  issue.affected_target === 'script' ? 'السكريبت الصوتي' :
                                  issue.affected_target === 'metadata' ? 'العناوين والوصف والميتاداتا' :
                                  issue.affected_target === 'scenes' ? 'رسم المشاهد والبصريات' :
                                  'كامل الملفات'
                                }
                              </span>
                            </div>

                            <h5 className="font-bold text-[#fafafa] text-sm leading-snug">{issue.title_ar}</h5>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed">{issue.description_ar}</p>

                            <div className="mt-3 pt-3 border-t border-[#27272a]/40 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90">
                                <Sparkles size={11} className="shrink-0" />
                                <span>خطة المعالجة: {issue.action_plan_ar}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom bar warning info */}
              <div className="p-4 bg-[#1a1c23]/40 rounded-xl border border-[#27272a]/60 text-[11px] text-[#71717a] font-arabic leading-relaxed flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <span>عند الضغط على "تطهير وإصلاح الملفات"، سيعدل الذكاء الاصطناعي الأجزاء المعينة مباشرة في التحرير وستتحدث جميع ملفات التحميل لتنزل فوراً منقحة وخالية من الترهل.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 relative z-10" dir="rtl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
            <div>
               <h3 className="text-lg font-bold text-[#fafafa] font-arabic flex items-center gap-2">
                 <Activity className="text-[#10b981]" size={18} />
                 مقياس السرد الصوتي وجاذبية أول 30 ثانية
               </h3>
               <p className="text-xs text-[#a1a1aa] font-arabic">
                 مسؤول عن مسح الكلمات ونبرة الخطاف لضمان بقاء المشاهدين والاستبقاء (Retention).
               </p>
            </div>
            
            <button
              onClick={handleEvaluateLegacy}
              disabled={isEvaluating}
              className="bg-[#10b981] hover:bg-[#164346]/80 text-[#fafafa] px-5 py-2.5 rounded-xl text-xs font-bold font-arabic active:scale-95 transition-all outline-none border border-[#10b981]/50 shadow-sm flex items-center justify-center gap-2 shrink-0 self-end md:self-auto"
            >
              {isEvaluating ? (
                <>
                  <Compass size={14} className="animate-spin" />
                  جاري تشريح السمعيات...
                </>
              ) : (
                <>
                  <Search size={14} />
                  تقييم قوة السرد صهرًا
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
                className="overflow-hidden space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 border-t border-[#27272a] pt-6">
                   
                   {/* Score */}
                   <div className="col-span-1 flex flex-col items-center justify-center bg-[#09090b]/80 p-6 rounded-xl border border-[#10b981]/50 shadow-sm">
                      <div className="text-5xl font-mono text-[#4ade80] font-black tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                        {evaluation.score}<span className="text-xl text-[#71717a]">/100</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#a1a1aa] font-bold">الدرجة الشاملة</span>
                   </div>

                   {/* Metrics */}
                   <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                        <span className="flex items-center gap-2 text-xs font-semibold text-[#6366f1] mb-2 uppercase tracking-wide">
                           <Zap size={14} /> قوة الخطاف (Hook Strength)
                        </span>
                        <p className="text-sm text-[#fafafa] font-arabic">{evaluation.hook_strength}</p>
                      </div>
                      <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                        <span className="flex items-center gap-2 text-xs font-semibold text-[#4ade80] mb-2 uppercase tracking-wide">
                           <Activity size={14} /> توقع الاستبقاء (Retention)
                        </span>
                        <p className="text-sm text-[#fafafa] font-arabic">{evaluation.retention_prediction}</p>
                      </div>
                      <div className="bg-[#09090b]/50 p-4 border border-[#27272a] rounded-xl flex flex-col justify-center transition-all hover:bg-[#121214]">
                        <span className="flex items-center gap-2 text-xs font-semibold text-[#f87171] mb-2 uppercase tracking-wide">
                           <Scissors size={14} /> مؤشر حشو الكلمات (Fluff Index)
                        </span>
                        <p className="text-sm text-[#fafafa] font-arabic">{evaluation.fluff_index}</p>
                      </div>
                   </div>

                   {/* Tips */}
                   <div className="col-span-1 md:col-span-4 bg-[#10b981]/10 p-5 rounded-xl border border-[#10b981]/30 mt-2">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                       <h4 className="flex items-center gap-2 text-[#10b981] text-sm font-bold uppercase tracking-wider font-mono">
                         <Award size={16} /> نصائح تكتيكية لتحسين السكريبت الصوتي:
                       </h4>
                       
                       {onRefined && (
                         <button 
                           onClick={handleAutoRefineLegacy}
                           disabled={isRefining}
                           className="w-full sm:w-auto bg-[#4f46e5] hover:bg-[#6366f1] text-[#fff] text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                         >
                           {isRefining ? <Compass size={14} className="animate-spin" /> : <Wand2 size={14} />}
                           تحسين السكريبت تلقائياً (Auto-Refine)
                         </button>
                       )}
                     </div>
                     <ul className="space-y-2">
                        {evaluation.actionable_tips.map((tip, idx) => (
                          <li key={idx} className="text-[#e5e3e0] text-sm font-arabic flex items-start gap-2">
                            <span className="text-[#10b981] mt-1">•</span> {tip}
                          </li>
                        ))}
                     </ul>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
