import { api } from "./api";
import { ApiResponse, Campaign, CampaignListResponse } from "../types";

export const campaignService = {
  async list(params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<CampaignListResponse>> {
    const res = await api.get<ApiResponse<CampaignListResponse>>("/campaigns", {
      params,
    });
    return res.data;
  },

  async getById(id: string): Promise<ApiResponse<Campaign>> {
    const res = await api.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return res.data;
  },

  async create(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const res = await api.post<ApiResponse<Campaign>>("/campaigns", data);
    return res.data;
  },

  async update(
    id: string,
    data: Partial<Campaign>,
  ): Promise<ApiResponse<Campaign>> {
    const res = await api.put<ApiResponse<Campaign>>(`/campaigns/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await api.delete<ApiResponse<{ id: string }>>(
      `/campaigns/${id}`,
    );
    return res.data;
  },
};
