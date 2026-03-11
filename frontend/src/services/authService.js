import { apiClient } from "./apiClient";
import { tokenStorage } from "./tokenStorage";

export const authService = {
  login: (payload) => apiClient.post("/auth/login", payload),
  signup: (payload) => apiClient.post("/auth/signup", payload),
  me: () => apiClient.get("/auth/me"),
  logout: () => tokenStorage.clear()
};
