import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useTacticalSound } from "../hooks/useTacticalSound";

type PageType = "content" | "archive" | "settings" | "warRoom" | "scriptEditor" | "scheduler" | "trends" | "analytics" | "graph";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: PageType;
}

export default function DashboardLayout({
  children,
  currentPage,
}: DashboardLayoutProps) {
  const { startHum, playHover, playClick } = useTacticalSound();
  const [systemStatus, setSystemStatus] = useState({
    latency: 12,
    vectorNodes: 0,
    tokensProcessed: 0,
    status: "BOOTING..."
  });
  const [ollamaStatus, setOllamaStatus] = useState("OFFLINE");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const start = Date.now();
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          // Calculate actual latency or use server reported
          const actualLatency = Date.now() - start;
          setSystemStatus({
            ...data,
            latency: actualLatency
          });
        }
      } catch (err) {
        setSystemStatus(prev => ({ ...prev, status: "OFFLINE" }));
      }
      
      try {
        const ollamaRes = await fetch("/api/ollama/status");
        if (ollamaRes.ok) {
           const ollamaData = await ollamaRes.json();
           setOllamaStatus(ollamaData.status === "online" ? "ONLINE" : "OFFLINE");
        } else {
           setOllamaStatus("OFFLINE");
        }
      } catch (err) {
        setOllamaStatus("OFFLINE");
      }
    };

    fetchStatus();
    const cleanup = startHum();

    const handleZenToggle = (e: any) => {
      if (e.detail?.zenMode !== undefined) {
         document.documentElement.classList.toggle('zen-mode', e.detail.zenMode);
      }
    };
    window.addEventListener('toggle-zen-mode', handleZenToggle);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('toggle-zen-mode', handleZenToggle);
    };
  }, []);

  return (
    <div 
      className="flex h-screen bg-[#F8F9FA] text-[#1F2937] selection:bg-blue-100 selection:text-gray-900 font-arabic overflow-hidden relative" 
      dir="rtl"
      onClick={playClick}
    >
      <div className="zen-hidden z-20 relative bg-white border-l border-gray-100 shadow-sm">
         <Sidebar currentPage={currentPage} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden group zen-unborder">
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar z-10 w-full max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              <div className="p-10 lg:p-14">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Status Bar */}
        <div className="zen-hidden absolute bottom-0 left-0 right-0 h-10 bg-white/80 backdrop-blur-md border-t border-gray-200 flex items-center justify-between px-6 z-50 text-gray-500 font-mono text-[11px] shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${systemStatus.status === 'SECURE' ? 'bg-green-500 shadow-sm' : 'bg-red-500'}`}></span>
              <span className="tracking-widest uppercase font-semibold">Studio_Workspace // ACTIVE</span>
            </div>
            
            <div className="flex items-center gap-2 border-l pl-6 border-gray-200 ml-2">
              <span className={`w-2 h-2 rounded-full ${ollamaStatus === 'ONLINE' ? 'bg-green-600 shadow-sm shadow-green-500/40 animate-pulse' : 'bg-red-500 shadow-sm shadow-red-500/40'}`}></span>
              <span className="tracking-widest uppercase font-semibold flex items-center gap-1">
                 Local_Core <span className="opacity-50">[{ollamaStatus === 'ONLINE' ? 'gemma-4' : 'OFFLINE'}]</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
               <span className="opacity-70">LATENCY:</span>
               <span className="font-bold text-gray-700">{systemStatus.latency}MS</span>
             </div>
             <div className="flex items-center gap-3">
               <span>{new Date().toLocaleTimeString('en-GB', { hour12: false })}</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
