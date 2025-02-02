import { api } from "./config";

export const urlService = {
  createShortUrl: async (originalUrl: string) => {
    const { data } = await api.post("/", { originalUrl });
    return data;
  },
  getUserUrls: async (page: number = 1, limit: number = 5) => {
    const { data } = await api.get(`/?page=${page}&limit=${limit}`);
    return data;
  },

  getUrlStats: async (shortCode: string) => {
    const { data } = await api.get(`/stats/${shortCode}`);
    return data;
  },
  getOriginalUrl: async (shortCode: string) => {
    const { data } = await api.get(`/${shortCode}`);
    return data;
  },
  deleteShortUrl: async (shortCode: string) => {
    const { data } = await api.delete(`/${shortCode}`);
    return data;
  },
};
