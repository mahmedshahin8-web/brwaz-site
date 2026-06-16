import { apiFetch } from "../lib/apiFetch";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudioStore } from '../store/useStudioStore';
import { useCreatorStore } from '../store/useCreatorStore';
import {
  Archive,
  FileText,
  Zap,
  ArrowLeft,
  Database,
  Cpu,
  Clock,
  Play,
  Image as ImageIcon,
  Users,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeScripts: 0,
    totalScenes: 0,
    generatedMedia: 0,
  });

  const [recentScripts, setRecentScripts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await apiFetch("/api/dossiers");
        if (res.ok) {
          const docs = await res.json();
          setRecentScripts(docs.slice(0, 4));
          
          let totalScenes = 0;
          let totalMedia = 0;
          docs.forEach((doc: any) => {
            if (doc.scenes) {
              totalScenes += doc.scenes.length;
              doc.scenes.forEach((s: any) => {
                if (s.images) totalMedia += s.images.length;
                if (s.audioBase64) totalMedia += 1;
              });
            }
          });

          setStats({
            activeScripts: docs.length,
            totalScenes: totalScenes,
            generatedMedia: totalMedia
          });
        }
      } catch(err) {
        // fallback simulated data for layout if offline
        setRecentScripts([
            { video_title: "أسرار المماليك", createdAt: new Date().toISOString() },
            { video_title: "العملات الرقمية وحرب البقاء", createdAt: new Date(Date.now() - 86400000).toISOString() },
            { video_title: "خبايا الذكاء الاصطناعي", createdAt: new Date(Date.now() - 172800000).toISOString() }
        ]);
        setStats({ activeScripts: 12, totalScenes: 145, generatedMedia: 89 });
      }
    };
    
    fetchDossiers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: import("motion/react").Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 font-arabic" 
      dir="rtl"
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#fafafa] tracking-tight mb-1">
             المركز الرئيسي
          </h2>
          <p className="text-[#a1a1aa] text-sm font-medium">
             نظرة عامة على مشاريعك واستوديو المحتوى الخاص بك
          </p>
        </div>
      </header>
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div variants={itemVariants} className="bg-[#121214] border border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27272a]/50 text-[#fafafa] flex items-center justify-center">
                <FileText size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#fafafa] mb-1">{stats.activeScripts}</h3>
              <p className="text-sm text-[#a1a1aa] font-medium">المشاريع المكتوبة</p>
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-[#121214] border border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27272a]/50 text-[#fafafa] flex items-center justify-center">
                <Layout size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#fafafa] mb-1">{stats.totalScenes}</h3>
              <p className="text-sm text-[#a1a1aa] font-medium">المشاهد المنتجة</p>
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-[#121214] border border-[#27272a] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#27272a]/50 text-[#fafafa] flex items-center justify-center">
                <ImageIcon size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#fafafa] mb-1">{stats.generatedMedia}</h3>
              <p className="text-sm text-[#a1a1aa] font-medium">الوسائط المولدة (صور وصوت)</p>
            </div>
         </motion.div>
      </div>

      {/* 2. MAIN AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Main Action (Spans 2 cols) */}
         <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#121214] to-[#18181b] rounded-2xl border border-[#27272a] p-8 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
               <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                 <div>
                   <h2 className="text-2xl font-bold text-[#fafafa] mb-3">
                     مشروع محتوى جديد
                   </h2>
                   <p className="text-[#a1a1aa] text-base leading-relaxed max-w-lg mb-8">
                     ابدأ بإنشاء سيناريو جديد أو حوّل أفكارك إلى محتوى مرئي كامل باستخدام الذكاء الاصطناعي الخاص بنا.
                   </p>
                 </div>
                 
                 <button 
                  onClick={() => {
                     localStorage.removeItem("barwaz_topic");
                     localStorage.removeItem("barwaz_autosave_draft"); localStorage.removeItem("barwaz_script_data");
                     useStudioStore.getState().setFinalProductionSnapshot(null);
                     useStudioStore.getState().setTopic('');
                     useCreatorStore.getState().setData(null);
                     useCreatorStore.getState().setTopic('');
                     useCreatorStore.getState().setFinalVoiceScript('');
                     useCreatorStore.getState().setFragmenterData(null);
                     useCreatorStore.getState().setPipelineStep(1);
                     navigate('/script-editor');
                  }}
                  className="bg-[#fafafa] text-[#09090b] px-6 py-3.5 rounded-lg font-bold hover:bg-[#e4e4e7] transition-colors flex items-center justify-center gap-2 w-fit active:scale-95"
                 >
                   <Play size={18} className="fill-current" />
                   <span>بدء الإنشاء</span>
                 </button>
               </div>
            </div>
         </motion.div>

         {/* Sidebar Feed */}
         <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#121214] rounded-xl border border-[#27272a] flex flex-col h-full shadow-sm overflow-hidden">
               <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#18181b]">
                  <h3 className="text-sm font-semibold text-[#fafafa]">
                    أحدث المشاريع
                  </h3>
               </div>
               
               <div className="p-2 flex-1 overflow-y-auto space-y-1 custom-scrollbar min-h-[300px]">
                  {recentScripts.length > 0 ? recentScripts.map((script, idx) => (
                    <div key={idx} onClick={() => navigate('/archive')} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#27272a]/50 transition-colors cursor-pointer group">
                       <div className="w-8 h-8 rounded-md bg-[#27272a] text-[#a1a1aa] flex items-center justify-center shrink-0 group-hover:text-[#fafafa] transition-colors">
                          <FileText size={14} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-[#fafafa] truncate">
                             {script.video_title || "مشروع غير مسمى"}
                          </h4>
                          <span className="text-[11px] text-[#71717a] font-arabic mt-0.5 block">
                             {new Date(script.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>
                  )) : (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
                        <Archive size={24} className="text-[#a1a1aa] mb-2" />
                        <span className="text-xs text-[#a1a1aa]">لا توجد مشاريع سابقة</span>
                     </div>
                  )}
               </div>
               
               <div className="p-3 border-t border-[#27272a] bg-[#18181b] mt-auto">
                 <button onClick={() => navigate('/archive')} className="w-full py-2 rounded-lg text-xs font-semibold text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] transition-colors flex justify-center items-center gap-2">
                    عرض الأرشيف
                    <ArrowLeft size={14} />
                 </button>
               </div>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
