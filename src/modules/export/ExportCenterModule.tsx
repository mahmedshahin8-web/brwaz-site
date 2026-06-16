import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPremiereXML, exportToCSV } from '../../lib/exportUtils';
import { generateTxt, generateMd, generateTeleprompter, generateGeminiTTS, generateDocx } from '../../lib/exportFormatters';
import { useStudioStore } from '../../store/useStudioStore';
import { EpisodeData } from '../../types';

interface ExportCenterProps {
  fragmenterData: any;
  finalVoiceScript: string;
  data: EpisodeData;
}

export const ExportCenterModule: React.FC<ExportCenterProps> = ({ fragmenterData, finalVoiceScript, data }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const notify = {
    classified: (msg: string) => toast.success(msg),
    breach: (msg: string) => toast.error(msg),
  };

  const handleExport = async (exportFn: any, successMsg: string) => {
    if (!data) return;
    setIsLoading(true);
    setStatus("جاري معالجة وتجميع المستند...");
    
    try {
      // Create a small delay to let UI render the loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      exportFn({
        data,
        fragmenterData,
        finalVoiceScript
      });
      
      notify.classified(successMsg);
    } catch (e: any) {
      console.error("Export error:", e);
      notify.breach("فشل في استخراج الملف.");
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };

  const handleDownloadDossierTxt = () => handleExport(generateTxt, "تم التنزيل بنجاح!");
  const handleDownloadDossierMd = () => handleExport(generateMd, "تم التنزيل بنجاح!");
  const handleDownloadTeleprompterTxt = () => handleExport(generateTeleprompter, "تم التنزيل بنجاح!");
  const handleDownloadGeminiTTS = () => handleExport(generateGeminiTTS, "تم التنزيل بنجاح!");
  const handleDownloadDocx = () => handleExport(generateDocx, "تم التنزيل بنجاح!");

  return (
    <div className="bg-[#111722]/60 backdrop-blur-md border border-[#17202c] rounded-2xl p-4 shadow-subtle flex flex-col gap-3">
      <span className="text-[10px] font-arabic font-bold text-[#6d6964]   mb-1">مركز التصدير</span>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-4 border border-[#17202c] rounded-xl bg-[#0a0f16]/80 text-[#a8a09f] gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#d4a574]" />
          <span className="text-xs font-arabic ">{status}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadDossierTxt}
              className="w-full px-4 py-3 bg-[#17202c]/80 text-[#a8a09f] hover:bg-[#1f2937] hover:text-[#d4a574] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#17202c]"
            >
              <Download className="w-4 h-4" />
              تنزيل ملف (TXT) بسيط
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">ملف نصي خفيف وسريع يحتوي على السطور الأساسية للقراءة السريعة والأرشفة.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadTeleprompterTxt}
              className="w-full px-4 py-3 bg-[#1a0f14]/80 text-[#d48a8a] hover:bg-[#2d1b22] hover:text-[#f0a8a8] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#3d242e]"
            >
              <Download className="w-4 h-4" />
              نسخة الملقن الصوتي التلقيدية (Teleprompter)
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">نسخة نظيفة تحتوي على كلام المعلق (Voice-over) فقط للقراءة أمام الكاميرا أو للتسجيل المايك البشري بدون أي تشتيت بصري.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadGeminiTTS}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#17202c] to-[#1e1b4b] text-[#a5b4fc] hover:from-[#1e293b] hover:to-[#312e81] hover:text-[#c7d2fe] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#3730a3] shadow-[0_0_15px_rgba(55,48,163,0.2)]"
            >
              <Download className="w-4 h-4" />
              حزمة التعليق الصوتي لـ (Gemini 3.1 TTS Preview)
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">ملف جاهز للذكاء الاصطناعي (TTS)، مزود بالتوجيهات الصوتية (Emotions & Pauses) والتشكيل لتوجيه أداء الموديل الصوتي.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadDossierMd}
              className="w-full px-4 py-3 bg-[#17202c]/80 text-[#a8a09f] hover:bg-[#1f2937] hover:text-[#d4a574] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#17202c]"
            >
              <Download className="w-4 h-4" />
              تنزيل ملف (MD) لـ Notion/Obsidian
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">ملف ماركداون (Markdown) منسق يمكنك سحبه مباشرة إلى Notion أو Obsidian ليحتفظ بالعناوين والتنسيقات.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadDocx}
              className="w-full px-4 py-3 bg-[#2b5797] text-[#f5f3f0] hover:bg-[#1e3d6b] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#2b5797]/50 shadow-[0_0_15px_rgba(43,87,151,0.2)]"
            >
              <Download className="w-4 h-4" />
              ملف Production (Word)
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">جدول الإنتاج المعتمد للمخرج. يعرض المشاهد وتوجيهات الصورة بجانب التعليق الصوتي لسهولة المونتاج وتنظيم التصوير.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                exportToPremiereXML(data);
                notify.classified("تم تصدير XML للمونتاج (Premiere/DaVinci)");
              }}
              className="w-full px-4 py-3 bg-[#6a359c] text-[#f5f3f0] hover:bg-[#4a246d] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#6a359c]/50 shadow-[0_0_15px_rgba(106,53,156,0.2)]"
              title="يولد ملف XML يحافظ على ترتيب المشاهد لبرامج المونتاج"
            >
              <Download className="w-4 h-4" />
              تصدير XML (Premiere)
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">بمجرد سحبه إلى Premiere أو DaVinci، يبني لك (Timeline) متوقعة بالمشاهد جاهزة لتبدأ المونتاج مباشرة.</p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                exportToCSV(data);
                notify.classified("تم تصدير ملف الإكسيل (CSV)");
              }}
              className="w-full px-4 py-3 bg-[#205a35] text-[#f5f3f0] hover:bg-[#153e24] font-bold active:scale-95 text-xs font-arabic  flex items-center justify-center gap-2 transition-all rounded-xl border border-[#205a35]/50 shadow-[0_0_15px_rgba(32,90,53,0.2)]"
              title="تصدير جدول المشاهد كملف إكسيل CSV"
            >
              <Download className="w-4 h-4" />
              تصدير مشاهد CSV
            </button>
            <p className="text-[10px] text-[#6d6964] px-1 text-center font-arabic">جدول Excel ممتاز لتوزيع المهام على فريق الإنتاج وتتبع حالة كل مشهد (Voiceover/Visuals).</p>
          </div>
        </div>
      )}
    </div>
  );
};

