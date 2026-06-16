import React from "react";
import { BookOpen, Archive, Settings, LayoutDashboard, Zap, Calendar, BarChart2, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "المركز الرئيسي", icon: LayoutDashboard },
    { id: "script-editor", label: "كتابة السيناريو", icon: BookOpen },
    { id: "content", label: "صناعة المحتوى", icon: Zap },
    { id: "scheduler", label: "خطة النشر", icon: Calendar },
    { id: "archive", label: "الأرشيف", icon: Archive },
    { id: "analytics", label: "التقارير", icon: BarChart2 },
  ];

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 pointer-events-none bg-[#09090b]/80  border-b border-[#27272a]/50" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex justify-between items-center pointer-events-auto">
        
        {/* Logo / Brand Area */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#1e40af] flex items-center justify-center font-arabic font-extrabold text-lg transition-transform group-hover:scale-105">
                ب
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-[#fafafa] font-bold tracking-wide">برواز ستوديو</span>
                <span className="text-[10px] text-[#a1a1aa]">مساحة العمل</span>
            </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'dashboard');

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    isActive ? "text-[#fafafa]" : "text-[#71717a] hover:text-[#d4d4d8] hover:bg-[#27272a]/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-[#27272a] rounded-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={16} className={`relative z-10 ${isActive ? "text-[#4f46e5]" : ""}`} />
                  <span className={`relative z-10 text-sm font-arabic ${isActive ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
        </nav>

        {/* Right Area: Settings & User */}
        <div className="flex items-center gap-2">
             <button 
               onClick={() => navigate('/settings')}
               className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${location.pathname.includes('settings') ? 'bg-[#27272a] text-[#fafafa]' : 'hover:bg-[#27272a]/50 text-[#71717a] hover:text-[#fafafa]'}`}
             >
                <Settings size={18} />
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#ec4899] flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer ml-1">
                 م
             </div>
        </div>

      </div>
    </div>
  );
}
