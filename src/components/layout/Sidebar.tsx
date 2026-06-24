import React, { useState } from "react";
import { BookOpen, Settings, Zap, Home, Menu, Search, User, LogOut, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "content", label: "غرفة الكتابة", icon: Zap },
    { id: "knowledge", label: "لوحة التحقيقات", icon: BookOpen },
    { id: "settings", label: "الأورطمزيون (الإعدادات)", icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-black/40 backdrop-blur-3xl border-l border-white/[0.03] flex flex-col z-50 fixed right-0 top-0 transition-all duration-300"
      dir="rtl"
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.03]">
         <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
             <div className="w-8 h-8 min-w-[32px] rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#3b82f6] text-white flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                AI
             </div>
             {!collapsed && (
                 <span className="text-sm font-bold text-white tracking-widest uppercase font-sans">Studio</span>
             )}
         </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto custom-scrollbar">
          {!collapsed && <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] px-3 mb-2 font-bold">Main Navigation</div>}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'content');

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id === 'knowledge' ? 'graph' : item.id === 'content' ? 'content' : item.id}`)}
                className={`relative flex items-center gap-3  rounded-xl transition-all duration-200 group ${collapsed ? 'justify-center w-12 h-12 mx-auto px-0' : 'px-4 py-3'} ${
                  isActive ? "bg-white/5 text-white" : "text-[#71717a] hover:bg-white/[0.03] hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#4f46e5] rounded-l-full"
                  />
                )}
                <Icon size={18} className={`relative z-10 ${isActive ? 'text-[#4f46e5]' : ''}`} />
                {!collapsed && (
                    <span className={`relative z-10 text-sm whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>
                      {item.label}
                    </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-4">
          <button 
             onClick={() => setCollapsed(!collapsed)}
             className={`w-full flex items-center gap-3 text-[#71717a] hover:text-white transition-colors ${collapsed ? 'justify-center' : 'px-2'}`}
          >
             <Menu size={18} />
             {!collapsed && <span className="text-sm font-medium whitespace-nowrap">تصغير القائمة</span>}
          </button>
          
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center min-w-[32px]">
                  <User size={14} className="text-white/70" />
              </div>
              {!collapsed && (
                  <div className="flex flex-col text-right overflow-hidden">
                      <span className="text-xs text-white font-medium truncate">محمود أحمد</span>
                      <span className="text-[10px] text-white/40 truncate">mahmoud@studio.ai</span>
                  </div>
              )}
          </div>
      </div>
    </motion.div>
  );
}
