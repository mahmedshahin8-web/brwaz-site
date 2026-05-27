import { apiFetch } from "../lib/apiFetch";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Eye,
  FileText,
  Zap,
  Activity,
  ArrowLeft,
  Database,
  BarChart,
  Users
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeScripts: 0,
    totalScenes: 0,
  });

  const [recentScripts, setRecentScripts] = useState<any[]>([]);
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [systemInfo, setSystemInfo] = useState({
    vramLoad: "5.82/6.0 GB",
    tokenRate: "85 t/s"
  });

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const res = await apiFetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          setSystemInfo({
            vramLoad: data.vramLoad || "5.82/6.0 GB",
            tokenRate: data.tokenRate || "85 t/s"
          });
        }
      } catch (err: any) {
        // silently handled
      }
    };
    fetchSystemInfo();
  }, []);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await apiFetch("/api/dossiers");
        if (res.ok) {
          const docs = await res.json();
          setRecentScripts(docs.slice(0, 3));
          
          let totalScenes = 0;
          docs.forEach((doc: any) => {
            if (doc.scenes) totalScenes += doc.scenes.length;
          });

          setStats({
            activeScripts: docs.length,
            totalScenes: totalScenes,
          });
        }
      } catch(err) {
        // silently handle offline dev server
      }
    };
    
    const fetchTrends = async () => {
       try {
           const res = await apiFetch("/api/trends/public");
           if (res.ok) {
               const data = await res.json();
               if(data.items) {
                   setTickerItems(data.items.slice(0, 6)); // Take top 6
               }
           }
       } catch(err) {
           // silently handle offline dev server
       }
    };

    fetchDossiers();
    fetchTrends();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header Section */}
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 font-arabic mb-2">
            مرحباً بك في برواز ستوديو
          </h2>
          <p className="text-gray-500 font-arabic">
            إدارة المحتوى، متابعة الأحداث الساخنة، وبناء السكريبتات الذكية من مكان واحد.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-end px-5 py-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 font-medium font-sans uppercase">VRAM Load</span>
              <span className="text-gray-900 font-bold font-sans">{systemInfo.vramLoad}</span>
           </div>
           <div className="flex flex-col items-end px-5 py-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 font-medium font-sans uppercase">Token Rate</span>
              <span className="text-gray-900 font-bold font-sans">{systemInfo.tokenRate}</span>
           </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard icon={FileText} label="إجمالي السكريبتات" value={stats.activeScripts} />
         <StatCard icon={Database} label="المشاهد المُعالجة" value={stats.totalScenes} />
         <StatCard icon={Activity} label="الأحداث المرصودة" value={tickerItems.length * 12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 font-arabic">
                 أحدث المشاريع
              </h3>
              <button onClick={() => navigate('/archive')} className="text-sm text-blue-600 active:scale-95 font-medium flex items-center gap-1 transition-colors">
                 عرض الكل <ArrowLeft size={14} />
              </button>
           </div>
           
           <div className="grid gap-4">
              {recentScripts.length > 0 ? recentScripts.map((script, idx) => (
                 <div key={idx} onClick={() => navigate('/archive')} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer flex justify-between items-center group">
                    <div className="flex flex-col">
                        <span className="text-xs text-blue-500 font-medium mb-1">
                           تاريخ: {new Date(script.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                        <h4 className="text-lg font-bold text-gray-900 font-arabic group-active:scale-95 transition-colors">
                           {script.video_title || "مشروع غير مسمى"}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {script.scenes && script.scenes.length > 0 ? script.scenes[0].text : 'جاري معالجة البيانات...'}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-active:scale-95 transition-opacity">
                       <ArrowLeft size={16} />
                    </div>
                 </div>
              )) : (
                <div className="bg-white p-10 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-3 cursor-pointer" onClick={() => navigate('/script-editor')}>
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <Archive size={24} />
                   </div>
                   <p className="text-gray-500 font-arabic">لا توجد مشاريع حالياً. انقر للبدء بإنشاء سكريبت جديد.</p>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-bold text-gray-900 font-arabic">
              إجراءات سريعة
           </h3>
           
           <div className="grid grid-cols-1 gap-4">
               <ActionCard 
                 title="توليد الوسائط" 
                 desc="صناعة وتعديل المواد البصرية" 
                 icon={Zap} 
                 onClick={() => navigate('/content')}
               />
               <ActionCard 
                 title="كتابة السيناريو" 
                 desc="إنشاء وتعديل النصوص" 
                 icon={FileText} 
                 onClick={() => navigate('/script-editor')}
               />
               <ActionCard 
                 title="المرصد" 
                 desc="مراقبة وتحليل التوجهات" 
                 icon={Eye} 
                 onClick={() => navigate('/graph')}
               />
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
       <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Icon size={24} />
       </div>
       <div className="flex flex-col">
          <span className="text-gray-500 text-sm">{label}</span>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
       </div>
    </div>
  )
}

function ActionCard({ title, desc, icon: Icon, onClick }: any) {
   return (
      <div 
         onClick={onClick}
         className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer flex flex-col gap-3 group"
      >
         <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 group-active:scale-95 group-active:scale-95 flex items-center justify-center transition-colors">
            <Icon size={20} />
         </div>
         <div>
            <h4 className="font-bold text-gray-900 font-arabic">{title}</h4>
            <p className="text-sm text-gray-500 font-arabic mt-1">{desc}</p>
         </div>
      </div>
   )
}
