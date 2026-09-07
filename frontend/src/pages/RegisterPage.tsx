import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Lock, Mail, User as UserIcon, ArrowRight } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      error("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      success("Account created successfully! Welcome to OmniMarket.");
      navigate("/dashboard");
    } catch (err: any) {
      let msg = "Registration failed. Please try again.";
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          name="name"
          placeholder="Sarah Jenkins"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<UserIcon className="w-4 h-4" />}
          required
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="sarah@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
          helperText="Minimum 8 characters with numbers & symbols"
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Free Account
        </Button>
      </form>
    </div>
  );
};
