import React from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, CheckCircle, Zap, Shield, Layers } from "lucide-react";

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Form Area */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-slate-950">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                OmniMarket<span className="text-brand-500">.AI</span>
              </span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right Hero / Branding Area */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative h-full flex flex-col justify-between p-12 lg:p-16 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md w-fit border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Structured Multi-Platform AI Copywriting</span>
          </div>

          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Turn one campaign idea into{" "}
              <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-accent-400 bg-clip-text text-transparent">
                high-converting content
              </span>{" "}
              for 9 channels.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Generate native hooks, captions, video scripts, audio briefs, and
              image generation prompts optimized specifically for Instagram,
              YouTube, LinkedIn, X, and more.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Platform-Native</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Custom character limits & rules
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Layers className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Multi-Media Prompts</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Image, video scripts & voiceover
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
            <span>© 2026 OmniMarket AI SaaS</span>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
