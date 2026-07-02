import React, { useState } from "react";
import { BookOpen, Settings, Zap, Home, Menu, Search, User, LogOut, ChevronRight, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    { id: "content", label: "غرفة الكتابة", icon: Zap },
    { id: "knowledge", label: "لوحة التحقيقات", icon: FileText },
    { id: "settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      className="h-screen bg-[#000000] border-l border-[#27272a] flex flex-col z-50 fixed right-0 top-0 transition-all duration-300"
      dir="rtl"
    >
      {/* Brand */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-[#27272a]">
         <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
             <div className="w-8 h-8 min-w-[32px] rounded flex items-center justify-center font-bold text-lg bg-[#fafafa] text-black">
                B
             </div>
             {!collapsed && (
                 <span className="text-xs font-bold text-[#fafafa] tracking-widest uppercase font-mono">Barwaz</span>
             )}
         </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'content');

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id === 'knowledge' ? 'graph' : item.id === 'content' ? 'content' : item.id}`)}
                className={`relative flex items-center gap-3 rounded transition-all duration-200 group ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2.5'} ${
                  isActive ? "bg-[#18181b] text-[#fafafa] shadow-[inset_-2px_0_0_#fafafa]" : "text-[#71717a] hover:bg-[#09090b] hover:text-[#e4e4e7]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className={`relative z-10`} />
                {!collapsed && (
                    <span className={`relative z-10 text-xs whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>
                      {item.label}
                    </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[#27272a] flex flex-col gap-4">
          <button 
             onClick={() => setCollapsed(!collapsed)}
             className={`w-full flex items-center gap-3 text-[#71717a] hover:text-[#fafafa] transition-colors ${collapsed ? 'justify-center' : 'px-2'}`}
          >
             <Menu size={16} />
             {!collapsed && <span className="text-xs font-medium whitespace-nowrap">تصغير القائمة</span>}
          </button>
      </div>
    </motion.div>
  );
}

