import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface LoadingStepProgressProps {
  platformName?: string;
  isGenerating: boolean;
}

const STEPS = [
  "Understanding your campaign context...",
  "Analyzing target audience & pain points...",
  "Applying platform optimization rules...",
  "Generating high-converting copy & hooks...",
  "Engineering media & creative visual prompts...",
];

export const LoadingStepProgress: React.FC<LoadingStepProgressProps> = ({
  platformName,
  isGenerating,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) =>
        prev < STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 1100);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="w-full max-w-lg mx-auto p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Generation in Progress
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {platformName
                ? `Crafting for ${platformName}`
                : "Orchestrating campaign output"}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 animate-pulse">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div className="space-y-3.5">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? "text-slate-400 dark:text-slate-500"
                  : isCurrent
                    ? "text-brand-600 dark:text-brand-400 font-semibold translate-x-1"
                    : "text-slate-300 dark:text-slate-700"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>

      {/* Animated progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-500 via-sky-500 to-accent-500 h-full transition-all duration-500 rounded-full"
          style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
