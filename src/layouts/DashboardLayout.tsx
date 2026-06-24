import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div 
      className="flex min-h-screen bg-[#030305] text-[#ededed] font-arabic overflow-hidden selection:bg-[#4f46e5]/40 selection:text-white relative"
      dir="rtl"
    >
      {/* Dynamic Cosmic Ambience */}
      <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-gradient-to-bl from-[#2e1065]/20 via-[#4f46e5]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-gradient-to-tr from-[#020617]/80 via-transparent to-transparent pointer-events-none" />

      {/* SIDEBAR ZONE */}
      <Sidebar />
      
      {/* CONTENT ZONE */}
      <div className="flex-1 mr-[260px] flex flex-col h-screen min-h-0 relative transition-all duration-300 w-[calc(100%-260px)]">
          
          {/* Top Header / Breadcrumb / Utilities */}
          <header className="h-[72px] shrink-0 border-b border-white/[0.02] bg-[#030305]/60 backdrop-blur-3xl px-10 flex items-center justify-between sticky top-0 z-40">
             <div className="flex items-center gap-5 text-white/40 text-[13px] font-medium tracking-wide">
                <span className="hover:text-white transition-colors cursor-pointer">المطبخ السري</span>
                <span className="text-white/20">/</span>
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">ماكينة الدحيح</span>
             </div>
             <div className="flex items-center gap-5">
                 <div className="relative group">
                    <Search className="w-[14px] h-[14px] text-white/30 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#4f46e5] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="استعلام مباشر..." 
                      className="bg-black/40 border border-white/5 rounded-2xl py-2 pr-11 pl-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#4f46e5]/40 focus:bg-black/60 focus:ring-1 focus:ring-[#4f46e5]/20 transition-all w-72 shadow-inner"
                    />
                 </div>
                 <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-black/40 hover:bg-white/5 transition-all border border-white/[0.04] relative group hover:border-white/10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#4f46e5]/0 to-[#4f46e5]/0 group-hover:from-[#4f46e5]/10 group-hover:to-transparent transition-all duration-500" />
                    <Bell size={16} className="text-white/50 group-hover:text-white transition-colors" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#4f46e5] border border-[#030305] shadow-[0_0_8px_rgba(79,70,229,0.8)]"></span>
                 </button>
             </div>
          </header>

          {/* MAIN SCROLLABLE CONTENT */}
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10 w-full px-6 md:px-10 pt-6 pb-32 custom-scrollbar scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1600px] mx-auto w-full pb-20"
              >
                  <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
      </div>
    </div>
  );
}

