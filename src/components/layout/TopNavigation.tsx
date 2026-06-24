import React from "react";
import { BookOpen, Settings, Zap, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: "content", label: "الاستوديو", icon: Zap },
    { id: "graph", label: "المسودات", icon: BookOpen }
  ];

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/[0.04]" dir="rtl">
      <div className="max-w-[1600px] w-full mx-auto px-8 h-16 flex justify-between items-center">
        
        {/* Logo / Brand Area */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/content')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c7322] text-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-110">
                S
            </div>
            <div className="hidden sm:flex flex-col">
                <span className="text-xs text-white font-bold tracking-[0.3em] font-sans uppercase">Suite</span>
            </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center gap-2 flex-1 justify-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.id) || (location.pathname === '/' && item.id === 'content');

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                    isActive ? "text-white" : "text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                  <Icon size={14} className="relative z-10" />
                  <span className={`relative z-10 text-xs ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
        </nav>

        {/* Right Area: Settings & User */}
        <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate('/settings')}
               className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${location.pathname.includes('settings') ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#a1a1aa] hover:text-white'}`}
             >
                <Settings size={16} />
             </button>
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white transition-opacity cursor-pointer hover:opacity-80 overflow-hidden">
                 <User size={15} />
             </div>
        </div>

      </div>
    </div>
  );
}
