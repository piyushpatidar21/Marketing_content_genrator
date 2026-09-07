import { api } from "./api";
import {
  ApiResponse,
  Generation,
  MultiGenerationResponse,
  DashboardStats,
  PlatformRule,
  MediaTypeRule,
} from "../types";

export const generationService = {
  async generate(data: {
    campaign_id: string;
    platforms: string[];
    media_types: string[];
    custom_instructions?: string;
  }): Promise<ApiResponse<MultiGenerationResponse>> {
    const res = await api.post<ApiResponse<MultiGenerationResponse>>(
      "/generations",
      data,
    );
    return res.data;
  },

  async list(params?: {
    skip?: number;
    limit?: number;
    campaign_id?: string;
    platform?: string;
    media_type?: string;
    favorite_only?: boolean;
  }): Promise<ApiResponse<Generation[]>> {
    const res = await api.get<ApiResponse<Generation[]>>("/generations", {
      params,
    });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Generation>> {
    const res = await api.get<ApiResponse<Generation>>(`/generations/${id}`);
    return res.data;
  },

  async update(
    id: string,
    data: { generated_content?: Record<string, any>; is_favorite?: boolean },
  ): Promise<ApiResponse<Generation>> {
    const res = await api.put<ApiResponse<Generation>>(
      `/generations/${id}`,
      data,
    );
    return res.data;
  },

  async regenerate(
    id: string,
    data: { modification_instruction?: string },
  ): Promise<ApiResponse<Generation>> {
    const res = await api.post<ApiResponse<Generation>>(
      `/generations/${id}/regenerate`,
      data,
    );
    return res.data;
  },

  async toggleFavorite(id: string): Promise<ApiResponse<Generation>> {
    const res = await api.post<ApiResponse<Generation>>(
      `/generations/${id}/favorite`,
    );
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await api.delete<ApiResponse<{ id: string }>>(
      `/generations/${id}`,
    );
    return res.data;
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const res = await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return res.data;
  },

  async getPlatforms(): Promise<ApiResponse<PlatformRule[]>> {
    const res = await api.get<ApiResponse<PlatformRule[]>>("/platforms");
    return res.data;
  },

  async getMediaTypes(): Promise<ApiResponse<MediaTypeRule[]>> {
    const res = await api.get<ApiResponse<MediaTypeRule[]>>("/media-types");
    return res.data;
  },
};
