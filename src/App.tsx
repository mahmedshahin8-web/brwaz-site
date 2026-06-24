import React from "react";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import ContentCreationPage from "./pages/ContentCreationPage";
import SettingsPage from "./pages/SettingsPage";
import { KnowledgeGraphPage } from "./pages/KnowledgeGraphPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CommandPalette } from "./components/CommandPalette";

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="bottom-left" 
        toastOptions={{
          className: 'glass-panel',
          style: {
            background: 'rgba(18, 18, 20, 0.8)',
            backdropFilter: 'blur(16px)',
            color: '#fafafa',
            boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            padding: '16px 20px',
            fontFamily: 'Cairo, sans-serif'
          }
        }} 
      />
      
      <BrowserRouter>
        <CommandPalette />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/content" element={<ContentCreationPage />} />
            <Route path="/graph" element={<KnowledgeGraphPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
