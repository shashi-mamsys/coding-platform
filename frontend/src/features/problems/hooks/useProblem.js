import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";

export function useProblem(id) {
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/problems/${id}`)
      .then(setProblem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { problem, error, loading };
}
