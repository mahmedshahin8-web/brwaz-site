import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, TerminalSquare } from 'lucide-react';

export const EliteTestPanel: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-12" dir="rtl">
      {/* Container with Glassmorphism and strict padding (p-8 = 32px) */}
      <div className="relative p-8 bg-gray-50 backdrop-blur-xl border border-gray-200 rounded-sm overflow-hidden">
        
        {/* Subtle glowing accent using Berwaz Red */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#eb2630]/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header - 8pt grid gap (gap-4 = 16px) */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex gap-4">
            {/* Berwaz Red accent symbol */}
            <div className="w-2 h-8 bg-[#eb2630] rounded-sm shadow-[0_0_15px_rgba(235,38,48,0.4)]" />
            <div className="flex flex-col gap-1">
              {/* Typography: Sans for Header */}
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                لوحة_التحكم_المركزية
              </h2>
              {/* Typography: Mono for micro-copy */}
              <span className="text-[10px] font-mono text-gray-600 tracking-[0.2em] uppercase">
                SYS.CORE.v4.5 // BERWAZ_ENGINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-gray-200 rounded-sm">
            {/* Berwaz Yellow for status indicator */}
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-600 animate-pulse' : 'bg-[#eb2630]'}`} />
            <span className="text-[9px] font-mono font-bold text-gray-900/70">
              {isSyncing ? 'جارِ_المزامنة' : 'متصل'}
            </span>
          </div>
        </div>

        {/* Content Section - 8pt grid gaps */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          <StatsBox 
            icon={<Cpu className="w-4 h-4 text-gray-500" />}
            label="معالج_البيانات"
            value="Ollama (Local)"
            status="مُفعل"
          />
          <StatsBox 
            icon={<Activity className="w-4 h-4 text-gray-500" />}
            label="معدل_التدفق"
            value="42.8 ms"
            status="مستقر"
          />
        </div>

        {/* Evidence Mapping Simulation */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">تحليل_النص // RAG</span>
            <span className="text-[10px] font-mono text-blue-600 uppercase tracking-[0.2em] animate-pulse">ربط_نشط</span>
          </div>
          <p className="text-sm text-gray-900/80 leading-relaxed font-arabic">
            يُظهر التاريخ أن نقطة التحول الأساسية لم تبدأ في العاصمة، بل انطلقت من الموانئ التجارية الكبرى
            <EvidenceTag docId="وثيقة_أرشيف_73" />
            حيث تم تداول المراسلات السرية تحت غطاء الشحنات الصناعية.
          </p>
        </div>

        {/* Action Button - STRICT Mechanical Tap (no hover) */}
        <div className="flex justify-start relative z-10">
          <motion.button
            whileTap={{ 
              scale: 0.98,
              borderColor: "rgba(235, 38, 48, 0.8)", // Berwaz Red flash
              backgroundColor: "rgba(235, 38, 48, 0.1)"
            }}
            onClick={handleSync}
            className="flex items-center gap-3 px-6 py-3 bg-white border-gray-100 shadow-sm border border-gray-200 rounded-sm transition-none"
          >
            <TerminalSquare className="w-4 h-4 text-gray-900/70" />
            <span className="text-xs font-mono font-bold tracking-widest text-gray-900/90">
              {isSyncing ? 'تهيئة...' : 'مزامنة_الخوادم'}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const StatsBox = ({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: string }) => (
  <div className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 flex flex-col gap-3">
    <div className="flex justify-between items-center">
      {icon}
      <span className="text-[8px] font-mono text-blue-600 tracking-widest">{status}</span>
    </div>
    <div>
      <h3 className="text-[9px] font-mono text-gray-500 mb-1">{label}</h3>
      <p className="text-sm font-bold font-mono text-gray-900/90">{value}</p>
    </div>
  </div>
);

const EvidenceTag = ({ docId }: { docId: string }) => (
  <motion.span 
    whileTap={{ scale: 0.95, backgroundColor: "rgba(240, 199, 34, 0.2)", borderColor: "rgba(240, 199, 34, 0.8)" }}
    className="inline-flex items-center gap-1 mx-1.5 px-2 py-0.5 bg-white/[0.03] border border-gray-200 rounded-sm cursor-pointer align-middle transition-none"
  >
    <ShieldAlert className="w-2.5 h-2.5 text-blue-600" />
    <span className="text-[9px] font-mono font-bold text-blue-600 tracking-widest">{docId}</span>
  </motion.span>
);
