import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { api } from "../services/api";
import { Badge } from "../components/common/Badge";
import {
  Settings as SettingsIcon,
  User,
  Activity,
  Sun,
  Moon,
  Laptop,
  Database,
  Cpu,
  Shield,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get("/health");
        setHealth(res.data);
      } catch (err) {
        console.error("Failed to fetch system health:", err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>System & Account</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage application appearance, active AI models, and inspect system
          telemetry.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            User Account Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Account Name
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {user?.name || "User"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
              Email Address
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {user?.email || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Customizer Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Theme & Appearance
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light", label: "Light Mode", icon: Sun },
            { id: "dark", label: "Dark Mode", icon: Moon },
            { id: "system", label: "System Default", icon: Laptop },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold gap-2 transition-all ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backend & AI Telemetry Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Backend Status & AI Provider Health
            </h2>
          </div>
          {health?.status === "healthy" ? (
            <Badge variant="emerald" size="sm">
              Operational
            </Badge>
          ) : (
            <Badge variant="amber" size="sm">
              Connecting...
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Provider</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white capitalize">
              {health?.ai_provider || "Gemini 1.5 Flash (Swappable)"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Database Engine</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white capitalize">
              {health?.database || "PostgreSQL / SQLite"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Version</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">
              v{health?.version || "1.0.0"} (
              {health?.environment || "development"})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
