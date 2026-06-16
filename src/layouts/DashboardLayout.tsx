import React from "react";
import TopNavigation from "../components/layout/TopNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa] font-arabic overflow-hidden selection:bg-[#4f46e5]/30 relative"
      dir="rtl"
    >
      {/* Absolute minimal background texture (Linear style) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />

      {/* 1. TOP NAVIGATION ZONE */}
      <TopNavigation />
      
      {/* 2. MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full pt-[90px] pb-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full max-w-[1400px] mx-auto px-6 w-full"
            >
                <Outlet />
            </motion.div>
          </AnimatePresence>
      </main>
    </div>
  );
}
