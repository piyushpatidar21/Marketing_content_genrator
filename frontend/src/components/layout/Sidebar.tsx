import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  History,
  ShieldCheck,
  Settings,
  PlusCircle,
  X,
  Compass,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Campaigns", to: "/campaigns", icon: Megaphone },
    {
      label: "Create Campaign",
      to: "/campaigns/new",
      icon: PlusCircle,
      highlight: true,
    },
    { label: "Generation History", to: "/generations", icon: History },
    { label: "Brand Profile", to: "/brand-profile", icon: ShieldCheck },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  OmniMarket<span className="text-brand-500">.AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  Content Engine
                </span>
              </div>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            <Link
              to="/campaigns/new"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Content</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard" || item.to === "/campaigns"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info card */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Compass className="w-4 h-4 text-brand-500" />
            <span>Multi-Channel Mode</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            9 platform native algorithms optimized for conversions.
          </p>
        </div>
      </aside>
    </>
  );
};
