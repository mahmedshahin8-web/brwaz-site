import React from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div 
      className="flex h-screen bg-[#F8F9FA] text-[#1F2937] font-arabic overflow-hidden" 
      dir="rtl"
    >
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 transition-all duration-300 ease-in-out">
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar z-10 w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full max-w-7xl mx-auto p-6 md:p-10 lg:p-12 mb-10"
            >
                <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
