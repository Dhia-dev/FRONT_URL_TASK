import { api } from "./config";

export const urlService = {
  createShortUrl: async (originalUrl: string) => {
    const { data } = await api.post("/urls", { originalUrl });
    return data;
  },
  getUserUrls: async () => {
    const { data } = await api.get("/urls");
    return data;
  },

  getUrlStats: async (shortCode: string) => {
    const { data } = await api.get(`/urls/stats/${shortCode}`);
    return data;
  },
  getOriginalUrl: async (shortCode: string) => {
    const { data } = await api.get(`/urls/${shortCode}`);
    return data;
  },
};
