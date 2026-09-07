import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (msg: string) => showToast(msg, "success"),
    [showToast],
  );
  const error = useCallback(
    (msg: string) => showToast(msg, "error", 5000),
    [showToast],
  );
  const info = useCallback(
    (msg: string) => showToast(msg, "info"),
    [showToast],
  );
  const warning = useCallback(
    (msg: string) => showToast(msg, "warning"),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ),
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
            warning: (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            ),
          };

          const borders = {
            success:
              "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100",
            error:
              "border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100",
            info: "border-sky-200 dark:border-sky-900/50 bg-sky-50/90 dark:bg-sky-950/80 text-sky-900 dark:text-sky-100",
            warning:
              "border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100",
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-fade-in ${borders[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 text-sm font-medium leading-snug">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
