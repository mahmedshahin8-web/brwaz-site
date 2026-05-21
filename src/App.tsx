import React, { useState, useEffect } from "react";
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from "./layouts/DashboardLayout";
import ContentCreationPage from "./pages/ContentCreationPage";
import ArchivePage from "./pages/ArchivePage";
import SettingsPage from "./pages/SettingsPage";
import { Home as WarRoomDashboard } from "./pages/home";
import { ScriptEditor } from "./pages/ScriptEditor";
import SchedulerPage from "./pages/SchedulerPage";
import TrendsPage from "./pages/TrendsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { KnowledgeGraphPage } from "./pages/KnowledgeGraphPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CommandPalette } from "./components/CommandPalette";
import { BootSequence } from "./components/BootSequence";

type PageType = "content" | "archive" | "settings" | "warRoom" | "scriptEditor" | "scheduler" | "trends" | "analytics" | "graph";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("warRoom");
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ page: PageType }>;
      setCurrentPage(customEvent.detail.page);
    };

    window.addEventListener("navigate", handleNavigate);
    return () => window.removeEventListener("navigate", handleNavigate);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "warRoom":
        return <WarRoomDashboard />;
      case "trends":
        return <TrendsPage />;
      case "scriptEditor":
        return <ScriptEditor />;
      case "content":
        return <ContentCreationPage />;
      case "scheduler":
        return <SchedulerPage />;
      case "archive":
        return <ArchivePage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      case "graph":
        return <KnowledgeGraphPage />;
      default:
        return <WarRoomDashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <Toaster 
        position="bottom-left" 
        gutter={8}
        toastOptions={{
          className: '',
          style: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            margin: 0
          }
        }} 
      />
      <CommandPalette />
      <AnimatePresence>
        {isBooting ? (
          <BootSequence key="boot" onComplete={() => setIsBooting(false)} />
        ) : null}
      </AnimatePresence>
      <DashboardLayout currentPage={currentPage}>
        {renderPage()}
      </DashboardLayout>
    </ErrorBoundary>
  );
}
