import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Lock, Mail, ArrowRight } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      let msg = "Login failed. Please check your credentials.";
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.code === "ERR_NETWORK" || !err.response) {
        msg =
          "Cannot connect to backend server. Please verify the backend is running on http://localhost:8000";
      }
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("sarah@example.com");
    setPassword("Password123!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Or{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            create a new account for free
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              defaultChecked
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            Fill Demo Credentials
          </button>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Tip:
        </span>{" "}
        If you haven't registered yet, you can register in seconds or use demo
        mode.
      </div>
    </div>
  );
};
