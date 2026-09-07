import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Sparkles, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center animate-fade-in">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-500">
          The requested route does not exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
