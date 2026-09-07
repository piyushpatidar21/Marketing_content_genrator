import { api } from "./api";
import { ApiResponse, BrandProfile } from "../types";

export const brandService = {
  async getProfile(): Promise<ApiResponse<BrandProfile | null>> {
    const res =
      await api.get<ApiResponse<BrandProfile | null>>("/brand-profile");
    return res.data;
  },

  async saveProfile(
    data: Partial<BrandProfile>,
  ): Promise<ApiResponse<BrandProfile>> {
    const res = await api.post<ApiResponse<BrandProfile>>(
      "/brand-profile",
      data,
    );
    return res.data;
  },
};
