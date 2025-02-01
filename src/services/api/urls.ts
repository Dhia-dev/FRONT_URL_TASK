import { api } from "./config";

export const urlService = {
  createShortUrl: async (originalUrl: string) => {
    const { data } = await api.post("/", { originalUrl });
    return data;
  },
  getUserUrls: async () => {
    const { data } = await api.get("/");
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
};
