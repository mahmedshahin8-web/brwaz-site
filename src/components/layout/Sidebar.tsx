import React, { useState } from "react";
import { BookOpen, Archive, Settings, LayoutDashboard, ChevronRight, Zap, Target, Calendar, Activity, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTacticalSound } from "../../hooks/useTacticalSound";

type PageType = "content" | "archive" | "settings" | "warRoom" | "scriptEditor" | "scheduler" | "trends" | "analytics" | "graph";

interface SidebarProps {
  currentPage: PageType;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { playClick, playHover } = useTacticalSound();

  React.useEffect(() => {
    const handleToggleZen = (e: any) => {
      if (e.detail && e.detail.zenMode !== undefined) {
        setIsCollapsed(e.detail.zenMode);
      }
    };
    window.addEventListener('toggle-zen-mode', handleToggleZen);
    return () => window.removeEventListener('toggle-zen-mode', handleToggleZen);
  }, []);

  const menuItems = [
    { id: "warRoom", label: "MAIN_COCKPIT", subtitle: "لوحة القيادة العامة", icon: LayoutDashboard },
    { id: "trends", label: "SIGNAL_SWEEP", subtitle: "رصد الأحداث الجارية", icon: Activity },
    { id: "scriptEditor", label: "LOG_PROTOCOL", subtitle: "صياغة الحلقات وإخراجها", icon: BookOpen },
    { id: "content", label: "ASSET_FORGE", subtitle: "انتاج وسائط ونصوص", icon: Zap },
    { id: "graph", label: "INTEL_GRAPH", subtitle: "مراقبة الكيانات والشبكات", icon: Target },
    { id: "scheduler", label: "OPS_CALENDAR", subtitle: "التخطيط الزمني للنشر", icon: Calendar },
    { id: "archive", label: "RESTRICTED_VAULT", subtitle: "قاعدة البيانات والمستندات", icon: Archive },
    { id: "analytics", label: "MISSION_INTEL", subtitle: "تقارير الأداء والمشاهدات", icon: BarChart2 },
    { id: "settings", label: "CORE_LINK", subtitle: "ضبط محرك الذكاء والنظام", icon: Settings },
  ];

  return (
    <motion.aside 
      animate={{ width: isCollapsed ? "80px" : "260px" }}
      className="bg-white text-[#1F2937] flex flex-col h-full relative z-20 group/sidebar"
      dir="rtl"
    >
      <button 
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          playClick();
        }}
        onMouseEnter={playHover}
        className="absolute -left-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 z-30 hover:border-blue-400 transition-all hover:text-blue-500 shadow-sm group/btn"
      >
        <ChevronRight size={12} className={`transform transition-transform ${isCollapsed ? "rotate-180" : "rotate-0"}`} />
      </button>

      {/* Brand Section */}
      <div className={`p-8 border-b border-gray-100 flex items-center ${isCollapsed ? "justify-center" : "justify-start"} h-[104px] relative overflow-hidden transition-all duration-300`}>
        {isCollapsed ? (
          <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg">
            <span className="font-arabic font-black text-blue-600 text-xl">ب</span>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm text-gray-900">
               <span className="font-arabic font-black text-xl leading-none pt-1">ب</span>
            </div>
            <div className="flex flex-col text-right">
              <h1 className="text-xl font-black font-arabic text-gray-800 tracking-wide leading-none">برواز</h1>
              <span className="text-gray-400 text-[10px] font-sans font-medium uppercase tracking-wider mt-1">
                Studio Workspace
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => {
                if (!isActive) playHover();
              }}
              onClick={() => {
                playClick();
                window.dispatchEvent(
                  new CustomEvent("navigate", { detail: { page: item.id } })
                );
              }}
              className={`w-full flex items-center px-4 py-3 relative rounded-lg transition-all 
                ${isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" 
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent"}
                flex-row-reverse`}
            >
              
              {!isCollapsed && (
                <div className="flex-1 text-right flex flex-col gap-0.5 ml-4">
                  <span className={`font-sans text-sm font-semibold transition-colors ${isActive ? "text-blue-700" : ""}`}>
                    {item.subtitle}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-wider ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </div>
              )}
              
              <Icon size={18} className={`shrink-0 ${isCollapsed ? "mx-auto" : "ml-4"} ${isActive ? "text-blue-600" : ""}`} />
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Profile or Settings */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-200 bg-white flex-row-reverse shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
              AS
            </div>
            <div className="flex flex-col text-right flex-1">
              <span className="text-gray-800 text-xs font-semibold">Ahmed Shahin</span>
              <span className="text-gray-400 text-[10px]">ahmed.shahin@example.com</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-full bg-indigo-100 mx-auto flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
            AS
          </div>
        )}
      </div>
    </motion.aside>
  );
}
