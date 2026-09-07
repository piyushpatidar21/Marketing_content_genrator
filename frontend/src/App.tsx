import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

// Layouts
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CampaignsListPage } from "./pages/CampaignsListPage";
import { CampaignNewPage } from "./pages/CampaignNewPage";
import { CampaignDetailPage } from "./pages/CampaignDetailPage";
import { GenerationsListPage } from "./pages/GenerationsListPage";
import { GenerationDetailPage } from "./pages/GenerationDetailPage";
import { BrandProfilePage } from "./pages/BrandProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected App Routes */}
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Campaigns */}
                <Route path="/campaigns" element={<CampaignsListPage />} />
                <Route path="/campaigns/new" element={<CampaignNewPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />

                {/* Generations */}
                <Route path="/generations" element={<GenerationsListPage />} />
                <Route
                  path="/generations/:id"
                  element={<GenerationDetailPage />}
                />

                {/* Brand Profile & Settings */}
                <Route path="/brand-profile" element={<BrandProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};
