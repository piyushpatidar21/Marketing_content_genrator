import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = "Copy",
  size = "md",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors border ${
        copied
          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800"
          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
      } ${
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
