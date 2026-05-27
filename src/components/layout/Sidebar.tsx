import React, { useState } from "react";
import { BookOpen, Archive, Settings, LayoutDashboard, ChevronRight, Zap, Calendar, BarChart2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "المركز الرئيسي", icon: LayoutDashboard },
    { id: "script-editor", label: "كتابة السيناريو", icon: BookOpen },
    { id: "content", label: "الوسائط والنصوص", icon: Zap },
    { id: "scheduler", label: "خطة النشر", icon: Calendar },
    { id: "archive", label: "المسودات والأرشيف", icon: Archive },
    { id: "analytics", label: "تقارير الأداء", icon: BarChart2 },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <aside 
      className={`bg-white text-gray-800 hidden md:flex flex-col h-full relative z-20 transition-all duration-300 ease-in-out border-l border-gray-100 shadow-sm shrink-0 ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}`}
      dir="rtl"
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 z-30 active:scale-95 focus:outline-none transition-colors active:scale-95 shadow-sm"
      >
        <ChevronRight size={14} className={`transform transition-transform ${isCollapsed ? "rotate-0" : "rotate-180"}`} />
      </button>

      {/* Brand Section */}
      <div className={`p-6 border-b border-gray-50 flex items-center ${isCollapsed ? "justify-center" : "justify-start gap-4"} h-24`}>
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md text-white shrink-0">
           <span className="font-arabic font-extrabold text-2xl pb-1">ب</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-right">
            <h1 className="text-xl font-bold font-arabic text-gray-900 leading-tight">برواز ستوديو</h1>
            <span className="text-gray-400 text-xs font-sans tracking-wide">Workspace</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center px-4 py-3 relative rounded-lg transition-colors duration-200 ${
                isActive 
                  ? "bg-blue-50/80 text-blue-700 font-semibold" 
                  : "bg-transparent text-gray-600 active:scale-95 active:scale-95"
              }`}
            >
              <Icon size={20} className={`shrink-0 ${isCollapsed ? "mx-auto" : "ml-4"} ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              {!isCollapsed && (
                <span className="text-md whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
