import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const login = (payload) => setUser(payload);
  const logout = () => setUser(null);
  return { user, login, logout, isAuthenticated: Boolean(user) };
}
