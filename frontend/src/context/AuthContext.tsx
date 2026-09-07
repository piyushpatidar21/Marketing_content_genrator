import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthResponse } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("omnimarket_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("omnimarket_token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem("omnimarket_token");
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem("omnimarket_user", JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("Failed to fetch user session:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const data: AuthResponse = res.data;
      setToken(data.access_token);
      localStorage.setItem("omnimarket_token", data.access_token);

      const dummyUser: User = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(dummyUser);
      localStorage.setItem("omnimarket_user", JSON.stringify(dummyUser));

      // Fetch full user record
      await refreshUser();
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirm_password: string,
  ) => {
    const regRes = await authService.register({
      name,
      email,
      password,
      confirm_password,
    });
    if (regRes.success) {
      // Auto login after registration
      await login(email, password);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("omnimarket_token");
    localStorage.removeItem("omnimarket_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
