import React, { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Outlet, useLocation } from "react-router-dom";
import { Search, Bell, Hexagon } from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div 
      className="flex min-h-screen bg-[#000000] text-[#fafafa] font-arabic overflow-hidden selection:bg-[#3b82f6]/30 selection:text-white relative"
      dir="rtl"
    >
      {/* Dynamic Cosmic Ambience - Removed for pure professional look */}
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-[#27272a] to-transparent pointer-events-none" />

      {/* SIDEBAR ZONE */}
      <Sidebar />
      
      {/* CONTENT ZONE */}
      <div className="flex-1 mr-[64px] flex flex-col h-screen min-h-0 relative transition-all duration-300 w-[calc(100%-64px)]">
          
          {/* Top Header / Breadcrumb / Utilities */}
          <header className="h-14 shrink-0 border-b border-[#27272a] bg-[#000000] px-6 flex items-center justify-between sticky top-0 z-40">
             <div className="flex items-center gap-3 text-[#71717a] text-xs font-mono font-medium tracking-wide">
                <Hexagon size={14} className="text-[#3b82f6]" />
                <span className="hover:text-[#fafafa] transition-colors cursor-pointer">Archive_Intel</span>
                <span className="text-[#27272a]">/</span>
                <span className="text-[#fafafa]">Master_Dossier</span>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="text-[#71717a] hover:text-[#fafafa] transition-colors"><Search size={16} /></button>
                <button className="text-[#71717a] hover:text-[#fafafa] transition-colors"><Bell size={16} /></button>
             </div>
          </header>

          {/* MAIN SCROLLABLE CONTENT */}
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10 w-full bg-[#09090b] px-4 md:px-8 pt-6 pb-32 custom-scrollbar scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="max-w-[1400px] mx-auto w-full pb-20"
              >
                  <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
      </div>
    </div>
  );
}

