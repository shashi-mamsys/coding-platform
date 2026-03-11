import { useEffect, useMemo, useState } from "react";
import { submissionService } from "../../services/submissionService";
import { LANGUAGES } from "../../utils/constants";

export default function SubmissionsPage() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const languageLabel = useMemo(() => {
    const map = new Map(LANGUAGES.map((lang) => [lang.id, lang.label]));
    return (id) => map.get(id) || id;
  }, []);

  useEffect(() => {
    submissionService
      .list()
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-xl border bg-white p-5 text-sm text-slate-600 shadow-sm">Loading...</div>;
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent submissions</h2>
        <span className="text-sm text-slate-500">{list.length} total</span>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Problem</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Passed</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr className="border-t">
                <td className="px-4 py-3 text-slate-600" colSpan={5}>
                  No submissions yet.
                </td>
              </tr>
            )}
            {list.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">
                  <a href={`/problems/${s.problemId}`} className="text-emerald-700 hover:underline">
                    {s.problemId}
                  </a>
                </td>
                <td className="px-4 py-3 text-slate-700">{languageLabel(s.language)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      s.status === "passed"
                        ? "bg-emerald-50 text-emerald-700"
                        : s.status === "failed"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {typeof s.passedCount === "number" && typeof s.totalCount === "number" && s.totalCount > 0
                    ? `${s.passedCount}/${s.totalCount}`
                    : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
