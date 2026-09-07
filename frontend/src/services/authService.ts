import { api } from "./api";
import { ApiResponse, AuthResponse, User } from "../types";

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  }): Promise<ApiResponse<User>> {
    const res = await api.post<ApiResponse<User>>("/auth/register", data);
    return res.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
};
