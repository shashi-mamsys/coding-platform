import { tokenStorage } from "./tokenStorage";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = tokenStorage.get();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    if (res.status === 401) {
      tokenStorage.clear();
      window.location.href = "/login";
      return;
    }
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) })
};
