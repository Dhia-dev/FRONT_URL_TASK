import { api } from "./config";

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },
  register: async (userData: RegisterData) => {
    const { data } = await api.post("/users", userData);
    return data;
  },
};
