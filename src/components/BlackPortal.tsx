import React, { useState } from 'react';
import { Terminal, Lock, Unlock, QrCode, Zap, Sparkles } from 'lucide-react';

export const BlackPortal: React.FC = () => {
    const [easterEggs, setEasterEggs] = useState<{ frame: string; hint: string; code: string }[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateEggs = () => {
        setIsGenerating(true);
        // Simulate generating complex Easter Eggs
        setTimeout(() => {
            setEasterEggs([
                { frame: "01:23 - في ملف التحقيق المفتوح على الطاولة", hint: "اقرأ الكلمات المشطوبة بالحبر الأسود", code: "PROJECT_MAY" },
                { frame: "04:15 - خلف المعلق في الشاشة الجانبية", hint: "ترجمة الشفرة الثنائية (Binary) الظاهرة لمدة ثانيتين", code: "01100010" }
            ]);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 text-gray-800 font-mono">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <Terminal className="w-6 h-6 text-fuchsia-500" />
                <div>
                    <h2 className="text-sm font-bold tracking-widest text-fuchsia-500">THE_BLACK_PORTAL</h2>
                    <p className="text-[10px] text-gray-600 uppercase">A.R.G & Easter Eggs Engine</p>
                </div>
            </div>

            <div className="space-y-4 font-arabic text-sm text-gray-900/70 mb-8" dir="rtl">
                <p>هذه البوابة مخصصة لتوليد "شفرات وألغاز" خفية لدمجها داخل الفيديو (بصرياً أو صوتياً).</p>
                <p>الهدف: خلق طبقة لعب (Alternate Reality Game) للمتابعين، لزيادة التفاعل وبقاء المشاهد.</p>
            </div>

            <button 
                onClick={generateEggs}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 w-full py-4 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-500 hover:bg-fuchsia-500/20 transition-colors tracking-widest font-bold"
            >
                {isGenerating ? <Zap className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? "GENERATING_CYPHERS..." : "GENERATE_EASTER_EGGS"}
            </button>

            {easterEggs.length > 0 && (
                <div className="mt-8 space-y-4" dir="rtl">
                    <h3 className="text-xs text-gray-600 tracking-widest uppercase mb-4 text-center">أفكار الغموض المقترحة لحلقة اليوم</h3>
                    
                    {easterEggs.map((egg, idx) => (
                        <div key={idx} className="bg-white border-gray-100 shadow-sm border border-gray-200 p-4 relative group">
                            <div className="absolute top-0 right-0 w-1 h-full bg-fuchsia-500/50 group-hover:bg-fuchsia-500 transition-colors"></div>
                            
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-fuchsia-400 font-mono" dir="ltr">{egg.code}</span>
                                <QrCode className="w-4 h-4 text-gray-600" />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-xs">
                                    <span className="text-gray-600">توقيت الظهور / المكان: </span>
                                    <span className="text-gray-900/80">{egg.frame}</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-gray-600">اللغز للمتابع: </span>
                                    <span className="text-gray-900/80">{egg.hint}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                                <button className="flex-1 py-1 bg-white border-gray-100 shadow-sm hover:bg-gray-100 text-xs text-gray-600 transition-colors border border-gray-200">
                                    نسخ الشفرة
                                </button>
                                <button className="flex-1 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 text-xs text-fuchsia-400 transition-colors cursor-not-allowed">
                                    توليد QR Code
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
