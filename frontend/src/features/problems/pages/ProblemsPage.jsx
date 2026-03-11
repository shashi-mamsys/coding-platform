import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";

export default function ProblemsPage() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/problems")
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Problems</h2>
        <span className="text-sm text-slate-500">{list.length} available</span>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <a href={`/problems/${p.id}`} className="text-emerald-700 hover:underline">
                    {p.title}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
