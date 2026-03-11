import { apiClient } from "./apiClient";

export const submissionService = {
  create: (payload) => apiClient.post("/submissions", payload),
  get: (id) => apiClient.get(`/submissions/${id}`),
  list: (problemId) => {
    if (!problemId) return apiClient.get("/submissions");
    return apiClient.get(`/submissions?problemId=${encodeURIComponent(problemId)}`);
  }
};
