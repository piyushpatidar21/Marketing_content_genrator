import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  History,
  ShieldCheck,
} from "lucide-react";

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Campaigns", to: "/campaigns", icon: Megaphone },
    {
      label: "Create",
      to: "/campaigns/new",
      icon: PlusCircle,
      isPrimary: true,
    },
    { label: "History", to: "/generations", icon: History },
    { label: "Brand", to: "/brand-profile", icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95 ${
                    isActive ? "scale-105" : ""
                  }`
                }
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 border-2 border-white dark:border-slate-950">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard" || item.to === "/campaigns"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
