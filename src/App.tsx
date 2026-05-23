import React from "react";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="bottom-left" 
        toastOptions={{
          className: '',
          style: {
            background: 'white',
            color: 'black',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '16px'
          }
        }} 
      />
      
      <BrowserRouter>
        <CommandPalette />
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<WarRoomDashboard />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="script-editor" element={<ScriptEditor />} />
            <Route path="content" element={<ContentCreationPage />} />
            <Route path="graph" element={<KnowledgeGraphPage />} />
            <Route path="scheduler" element={<SchedulerPage />} />
            <Route path="archive" element={<ArchivePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
