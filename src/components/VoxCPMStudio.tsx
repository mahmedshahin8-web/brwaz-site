import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, UploadCloud, ChevronLeft, ChevronDown, Check, Loader2, Play, Download, Server, Lightbulb, User } from 'lucide-react';
import { default as toast } from 'react-hot-toast';

interface VoxCPMStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}

export const VoxCPMStudio: React.FC<VoxCPMStudioProps> = ({ isOpen, onClose, initialText }) => {
  const [targetText, setTargetText] = useState(initialText);
  const [controlInstruction, setControlInstruction] = useState("");
  const [ultimateCloning, setUltimateCloning] = useState(false);
  const [serverUrl, setServerUrl] = useState("http://127.0.0.1:5000"); // Local VoxCPM endpoint
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showTeamAdvice, setShowTeamAdvice] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null);

  // Update text when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTargetText(initialText);
      setIsDone(false);
      setAudioUrl(null);
    }
  }, [isOpen, initialText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReferenceAudio(e.target.files[0]);
      toast.success('تم تحميل الملف الصوتي بنجاح');
    }
  };

  const handleGenerate = async () => {
    if (!targetText.trim()) {
      toast.error('أدخل النص المراد تحويله أولاً');
      return;
    }

    setIsGenerating(true);
    setIsDone(false);
    
    try {
      const formData = new FormData();
      formData.append('text', targetText);
      
      if (controlInstruction) {
        formData.append('instruction', controlInstruction);
      }
      
      if (ultimateCloning) {
        formData.append('ultimate_cloning', 'true');
      }

      if (referenceAudio) {
        formData.append('reference_audio', referenceAudio);
      }

      const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      setIsDone(true);
      toast.success('تم إنشاء الصوت بنجاح بواسطة VoxCPM المحلي');
    } catch (error) {
      console.error("VoxCPM Generation Error:", error);
      toast.error('فشل في الاتصال بالخادم المحلي. تأكد من تشغيل VoxCPM.');
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsDone(true);
        toast.success('(محاكاة) يرجى التأكد من تشغيل السيرفر للارتباط الفعلي');
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      toast('لا يوجد ملف صوتي فعلي للتشغيل في وضع المحاكاة', { icon: 'ℹ️' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        dir="rtl"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 50, opacity: 0 }}
          className="bg-[#27272a]/50 flex flex-col w-full max-w-lg h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#121214]  px-4 py-3 border-b flex items-center justify-between shadow-sm z-10 shrink-0">
            <h2 className="text-[#fafafa] font-semibold text-lg flex-1 text-center">أستوديو VoxCPM المحلي</h2>
            <button 
              onClick={onClose}
              className="text-[#71717a] hover:text-[#fafafa] p-2 bg-[#121214] rounded-full w-8 h-8 flex items-center justify-center absolute left-4 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar bg-[#f8f9fa] p-4 flex flex-col gap-4">
            
            {/* Experts Advice Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden shadow-sm">
              <button 
                onClick={() => setShowTeamAdvice(!showTeamAdvice)}
                className="w-full px-4 py-3 flex items-center justify-between text-blue-800 hover:bg-[#27272a]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-sm">نصائح فريق الخبراء: لصوت مصري طبيعي 100%</span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showTeamAdvice ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showTeamAdvice && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 flex flex-col gap-3 border-t border-blue-100/50 pt-3"
                  >
                    <div className="flex gap-3 bg-[#121214]  p-3 rounded-lg border border-blue-50 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 mb-1">مهندس الصوت</p>
                        <p className="text-xs text-[#e5e3e0] leading-relaxed">
                          "عشان الصوت ميبانش إنه ذكاء اصطناعي، ارفع (صوت مرجعي) مدته من 5 لـ 10 ثواني متسجل في مكان هادي جداً من غير أي زنة ولا صدى صوت. الموديل هياخد نفس النقاء ونبرة المتحدث بالظبط."
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 bg-[#121214]  p-3 rounded-lg border border-blue-50 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-700 mb-1">المخرج</p>
                        <p className="text-xs text-[#e5e3e0] leading-relaxed">
                          "استخدم الفواصل (،) والنقط (.) في النص بتاعك كتير! الموديل بيقف ياخد نفسه بجد عند كل علامة ترقيم وده اللي بيدي إحساس الروح البشرية للصوت. ولو العينة ممتازة، شغل (وضع الاستنساخ الفائق) وهتنبهر."
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-[#121214]  p-3 rounded-lg border border-blue-50 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-700 mb-1">المدقق اللغوي</p>
                        <p className="text-xs text-[#e5e3e0] leading-relaxed">
                          "الكلمات العامية بتتنطق صح لو كتبتها بالتشكيل (عَشَان كِدَه) أو لو كتبتها زي ما بتتنطق حرفياً في الشارع. لو مقولتش للموديل التشكيل ممكن ينطقها بصيغة فصحى غريبة تبوظ إحساس العامية."
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Server Settings */}
            <div className="bg-[#121214]  rounded-xl border border-[#27272a] overflow-hidden shadow-sm">
              <div className="bg-[#121214] px-3 py-2 flex items-center gap-2 border-b border-[#27272a]">
                <Server className="w-4 h-4 text-[#a1a1aa]" />
                <span className="text-[#e5e3e0] font-medium text-sm">رابط الخادم المحلي (Local Server)</span>
              </div>
              <div className="p-3">
                <input 
                  type="text" 
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full text-sm p-2 outline-none text-[#fafafa] bg-[#27272a]/50 border border-[#27272a] rounded-lg font-arabic text-left"
                  dir="ltr"
                  placeholder="http://127.0.0.1:5000"
                />
                <p className="text-xs text-[#71717a] mt-2 leading-relaxed">
                  أدخل رابط الخادم الذي يعمل عليه سكربت VoxCPM المحلي. سيتم إرسال طلب التوليد إلى المسار <span className="font-arabic bg-[#121214] px-1 rounded-lg">/api/generate</span>.
                </p>
              </div>
            </div>

            {/* Reference Audio Block */}
            <div className="bg-[#121214]  rounded-xl border border-[#27272a] overflow-hidden shadow-sm">
              <div className="bg-[#e4effc] px-3 py-2 flex items-center gap-2 border-b border-[#27272a]">
                <Mic className="w-4 h-4 text-[#3070d6]" />
                <span className="text-[#3b82f6] font-medium text-sm">الصوت المرجعي (اختياري - لاستنساخ نبرة وشخصية الصوت)</span>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
              
              <div 
                className="p-6 flex flex-col items-center justify-center border-b border-[#27272a] cursor-pointer hover:bg-[#27272a]/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-8 h-8 text-[#3b82f6] mb-2" />
                {referenceAudio ? (
                  <span className="text-green-600 font-medium text-sm text-center px-4 truncate w-full" dir="ltr">
                    ✅ {referenceAudio.name}
                  </span>
                ) : (
                  <>
                    <span className="text-[#3b82f6] text-sm">اسحب الملف الصوتي هنا</span>
                    <span className="text-[#71717a] text-xs my-1">- أو -</span>
                    <span className="text-[#3b82f6] text-sm hover:underline">اضغط لاختيار ملف من جهازك</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-center text-[#71717a] p-2 bg-[#27272a]/50 border-t border-[#27272a] leading-relaxed">
                 استخدم ملفاً صوتياً قصيراً (من 5 إلى 10 ثوانٍ) بصوت نقي وبدون موسيقى خلفية، ليتمكن النظام من تعلم نبرة الصوت واستنساخها.
              </p>
            </div>

            {/* Ultimate Cloning Toggle */}
            <div className="flex flex-col">
              <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-[#121214] rounded-lg transition-colors">
                <div className={`relative w-12 h-6 flex items-center rounded-full transition-colors mt-0.5 ${ultimateCloning ? 'bg-[#10b981]' : 'bg-gray-300'}`}>
                  <input type="checkbox" className="sr-only" checked={ultimateCloning} onChange={(e) => setUltimateCloning(e.target.checked)} />
                  <div className={`absolute right-1 w-4 h-4 bg-[#121214]  rounded-full transition-transform ${ultimateCloning ? '-translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-[#fafafa] font-medium text-sm">
                    <Mic className="w-4 h-4 text-[#e5e3e0]" />
                    وضع الاستنساخ الفائق <span className="text-[#71717a] font-normal">(Ultimate Cloning)</span>
                  </div>
                </div>
              </label>
              <p className="text-xs text-[#71717a] mr-16 mt-1 pl-4 leading-relaxed">
                يقوم هذا الوضع بتحليل الصوت المرجعي واستخراج كل تفاصيله وأحاسيسه بدقة شديدة. عند تفعيله، سيتم تجاهل تعليمات التحكم اليدوية الموجودة بالأسفل.
              </p>
            </div>

            {/* Control Instruction Block */}
            <div className={`bg-[#121214]  rounded-xl border border-[#27272a] overflow-hidden shadow-sm transition-opacity ${ultimateCloning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-[#e4effc] px-3 py-2 flex items-center gap-2 border-b border-[#27272a]">
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5 opacity-70">
                  <div className="bg-[#3070d6] rounded" />
                  <div className="bg-[#3070d6] rounded" />
                  <div className="bg-[#3070d6] rounded" />
                  <div className="bg-[#3070d6] rounded" />
                </div>
                <span className="text-[#3b82f6] font-medium text-sm">تعليمات التحكم (وصف طبيعة الصوت)</span>
              </div>
              <input 
                type="text" 
                value={controlInstruction}
                onChange={(e) => setControlInstruction(e.target.value)}
                placeholder="كمثال: شاب مصري يتحدث بحماس وسرعة، أو صوت هادئ وعميق للراوي"
                className="w-full text-sm p-4 outline-none text-[#fafafa] placeholder-gray-400"
              />
              <p className="text-[11px] text-[#71717a] p-2 px-3 bg-[#27272a]/50 border-t border-[#27272a] leading-relaxed">
                اكتب الوصف بالإنجليزية أو الصينية أو العربية (يفضل الإنجليزية للتحكم الأدق في المشاعر).
              </p>
            </div>

            {/* Target Text Block */}
            <div className="bg-[#121214]  rounded-xl border border-[#27272a] overflow-hidden shadow-sm">
              <div className="bg-[#e4effc] px-3 py-2 flex items-center gap-2 border-b border-[#27272a]">
                <span className="text-lg leading-none mb-1">✍️</span>
                <span className="text-[#3b82f6] font-medium text-sm">النص المراد تحويله (Target Text)</span>
              </div>
              <textarea 
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                className="w-full h-40 text-sm p-4 outline-none text-[#fafafa] resize-none font-[Cairo] leading-relaxed"
                dir="rtl"
                placeholder="اكتب السكربت هنا..."
              />
            </div>

            {/* Advanced Settings */}
            <div className="bg-[#121214]  rounded-xl border border-[#27272a] overflow-hidden shadow-sm flex items-center justify-between p-4 cursor-pointer hover:bg-[#27272a]/50 transition-colors">
              <div className="flex items-center gap-2 text-[#e5e3e0]">
                <span className="opacity-70">⚙️</span>
                <span className="text-sm font-medium">إعدادات متقدمة</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-[#71717a]" />
            </div>

          </div>

          {/* Bottom Generation Area */}
          <div className="bg-[#121214]  border-t p-4 shrink-0 flex flex-col gap-3">
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-14 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-[0.98] transition-all text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-medium relative overflow-hidden"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <span className="text-xl leading-none">↻</span>
                    توليد الصوت
                  </>
                )}
              </button>

              <AnimatePresence>
                {isDone && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full p-4 bg-[#27272a]/50 border border-[#27272a] rounded-xl"
                  >
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#e5e3e0] bg-[#27272a] text-blue-800 px-2 py-0.5 rounded-lg">🎵 نتيجة التوليد</span>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => {
                               if (audioUrl) {
                                  const a = document.createElement('a');
                                  a.href = audioUrl;
                                  a.download = 'voxcpm-generated.wav';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                               } else {
                                  toast('الوضع الحالي هو محاكاة. لا يوجد ملف لتحميله.', { icon: 'ℹ️' });
                               }
                             }}
                             className="text-[#71717a] hover:text-[#fafafa] flex items-center gap-1 text-xs font-medium"
                           >
                             <Download className="w-4 h-4" /> حفظ
                           </button>
                        </div>
                     </div>
                     <div className="w-full h-12 bg-[#27272a] rounded-lg flex items-center px-4">
                        <button 
                          onClick={playAudio}
                          className="w-8 h-8 bg-[#4f46e5] rounded-full flex items-center justify-center text-white ml-3 hover:bg-[#4f46e5] transition-colors shrink-0"
                        >
                           <Play className="w-4 h-4 mr-0.5" />
                        </button>
                        <div className="flex-1 h-3 bg-gray-300 rounded-full relative overflow-hidden">
                           <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-400 opacity-50 rounded-full"></div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

