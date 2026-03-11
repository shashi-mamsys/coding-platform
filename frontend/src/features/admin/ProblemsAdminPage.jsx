import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../services/apiClient";
import { Button } from "../../components/ui/Button";
import { LANGUAGES } from "../../utils/constants";

export default function ProblemsAdminPage() {
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [testsTouched, setTestsTouched] = useState(false);
  const [driverTouched, setDriverTouched] = useState(false);
  const languageOptions = useMemo(() => LANGUAGES.map((l) => l.id), []);
  const [form, setForm] = useState(() => ({
    id: "",
    title: "",
    difficulty: "easy",
    statement: "",
    constraints: "",
    exampleInput: "",
    exampleOutput: "",
    visibleTestsJson: "",
    hiddenTestsJson: "",
    driverPreview: "",
    published: false,
    allowedLanguages: languageOptions
  }));

  const load = () =>
    apiClient
      .get("/problems")
      .then((res) => setList(Array.isArray(res) ? res : []))
      .catch((e) => setMessage(e.message));

  useEffect(() => {
    load();
  }, []);

  const filteredList = useMemo(() => {
    if (filter === "published") return list.filter((p) => p.published && !p.deleted);
    if (filter === "draft") return list.filter((p) => !p.published && !p.deleted);
    if (filter === "deleted") return list.filter((p) => p.deleted);
    return list;
  }, [filter, list]);

  const updateStatus = async (id, next) => {
    await apiClient.patch(`/problems/${id}`, next);
    load();
  };

  const downloadTemplate = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/problems/template`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "problem-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleLanguage = (lang) => {
    setForm((prev) => {
      const exists = prev.allowedLanguages.includes(lang);
      const next = exists ? prev.allowedLanguages.filter((l) => l !== lang) : [...prev.allowedLanguages, lang];
      return { ...prev, allowedLanguages: next };
    });
  };

  const resetForm = () => {
    setForm({
      id: "",
      title: "",
      difficulty: "easy",
      statement: "",
      constraints: "",
      exampleInput: "",
      exampleOutput: "",
      visibleTestsJson: "",
      hiddenTestsJson: "",
      driverPreview: "",
      published: false,
      allowedLanguages: languageOptions
    });
    setTestsTouched(false);
    setDriverTouched(false);
  };

  const parseJsonArray = (raw) => {
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  };

  const buildDummyTests = (exampleInput, exampleOutput) => {
    const input = exampleInput?.trim() || "[1,2]|3";
    const output = exampleOutput?.trim() || "3";
    const visible = JSON.stringify(
      [{ id: "sample-1", input, expectedOutput: output, visibility: "public" }],
      null,
      2
    );
    const hidden = JSON.stringify(
      [{ id: "hidden-1", input, expectedOutput: output, visibility: "hidden" }],
      null,
      2
    );
    return { visible, hidden };
  };

  const buildDriverPreview = ({ title, exampleInput, exampleOutput, allowedLanguages }) => {
    const name = title?.trim() || "Problem";
    const input = exampleInput?.trim() || "[1,2]|3";
    const output = exampleOutput?.trim() || "3";
    const allowed = allowedLanguages?.length ? allowedLanguages : languageOptions;
    const parts = [];
    if (allowed.includes("javascript")) {
      parts.push(
        [
          `// JavaScript driver for ${name}`,
          "// Input format: pipe-separated args or JSON array",
          'const tests = require("./tests.json");',
          'const { solve } = require("./solution");',
          "",
          "const parse = (value) => {",
          "  try {",
          "    return JSON.parse(value);",
          "  } catch {",
          "    return value;",
          "  }",
          "};",
          "",
          "for (const t of tests) {",
          '  const raw = String(t.input ?? "");',
          '  const parts = raw.includes("|") ? raw.split("|") : [raw];',
          "  const args = parts.map((s) => parse(s.trim()));",
          "  const out = solve(...args);",
          "  const expected = t.expectedOutput ?? t.expected;",
          '  if (JSON.stringify(out) !== JSON.stringify(parse(String(expected ?? "")))) {',
          '    throw new Error("Mismatch for " + t.id);',
          "  }",
          "}",
          "",
          `// Example input: ${input}`,
          `// Example output: ${output}`
        ].join("\n")
      );
    }
    if (allowed.includes("python")) {
      parts.push(
        [
          `# Python driver for ${name}`,
          "# Input format: pipe-separated args or JSON array",
          "import json",
          "from solution import solve",
          "",
          "def parse(value):",
          "    try:",
          "        return json.loads(value)",
          "    except Exception:",
          "        return value",
          "",
          "with open(\"tests.json\", \"r\", encoding=\"utf-8\") as f:",
          "    tests = json.load(f)",
          "",
          "for t in tests:",
          "    raw = str(t.get(\"input\", \"\"))",
          "    parts = raw.split(\"|\") if \"|\" in raw else [raw]",
          "    args = [parse(p.strip()) for p in parts if p.strip() != \"\"]",
          "    out = solve(*args)",
          "    expected = t.get(\"expectedOutput\", t.get(\"expected\"))",
          "    if json.dumps(out, separators=(\",\", \":\"), ensure_ascii=True) != json.dumps(parse(str(expected or \"\")), separators=(\",\", \":\"), ensure_ascii=True):",
          "        raise Exception(\"Mismatch for \" + str(t.get(\"id\")))",
          "",
          `# Example input: ${input}`,
          `# Example output: ${output}`
        ].join("\n")
      );
    }
    return parts.join("\n\n");
  };

  const regenerateTests = () => {
    const { visible, hidden } = buildDummyTests(form.exampleInput, form.exampleOutput);
    setForm((prev) => ({ ...prev, visibleTestsJson: visible, hiddenTestsJson: hidden }));
    setTestsTouched(false);
  };

  const regenerateDriver = () => {
    const next = buildDriverPreview({
      title: form.title,
      exampleInput: form.exampleInput,
      exampleOutput: form.exampleOutput,
      allowedLanguages: form.allowedLanguages
    });
    setForm((prev) => ({ ...prev, driverPreview: next }));
    setDriverTouched(false);
  };

  useEffect(() => {
    if (testsTouched) return;
    const { visible, hidden } = buildDummyTests(form.exampleInput, form.exampleOutput);
    setForm((prev) => {
      if (prev.visibleTestsJson === visible && prev.hiddenTestsJson === hidden) return prev;
      return { ...prev, visibleTestsJson: visible, hiddenTestsJson: hidden };
    });
  }, [form.exampleInput, form.exampleOutput, testsTouched]);

  useEffect(() => {
    if (driverTouched) return;
    const next = buildDriverPreview({
      title: form.title,
      exampleInput: form.exampleInput,
      exampleOutput: form.exampleOutput,
      allowedLanguages: form.allowedLanguages
    });
    setForm((prev) => (prev.driverPreview === next ? prev : { ...prev, driverPreview: next }));
  }, [form.title, form.exampleInput, form.exampleOutput, form.allowedLanguages, driverTouched]);

  const buildPayload = () => {
    const constraints = form.constraints
      .split(/[\n;]/)
      .map((c) => c.trim())
      .filter(Boolean);
    const examples = form.exampleInput
      ? [{ input: form.exampleInput.trim(), output: form.exampleOutput.trim() }]
      : [];
    const visibleTests = parseJsonArray(form.visibleTestsJson);
    const hiddenTests = parseJsonArray(form.hiddenTestsJson);
    const payload = {
      id: form.id.trim(),
      title: form.title.trim(),
      difficulty: form.difficulty,
      statement: form.statement.trim(),
      constraints,
      examples,
      visibleTests,
      hiddenTests,
      driverPreview: form.driverPreview.trim(),
      published: form.published,
      allowedLanguages: form.allowedLanguages
    };
    if (!payload.id) delete payload.id;
    return payload;
  };

  const saveProblem = async () => {
    setMessage("");
    try {
      const payload = buildPayload();
      if (editingId) {
        const { id, ...updatePayload } = payload;
        await apiClient.patch(`/problems/${editingId}`, updatePayload);
        setMessage("Problem updated.");
      } else {
        await apiClient.post("/problems", payload);
        setMessage("Problem created.");
      }
      resetForm();
      setEditingId(null);
      load();
    } catch (e) {
      setMessage(e.message || "Failed to save problem");
    }
  };

  const startEdit = async (id) => {
    setMessage("");
    setLoadingEdit(true);
    try {
      const problem = await apiClient.get(`/problems/${id}`);
      const example = problem.examples?.[0] || {};
      setTestsTouched(true);
      setDriverTouched(true);
      setForm({
        id: problem.id || "",
        title: problem.title || "",
        difficulty: problem.difficulty || "easy",
        statement: problem.statement || "",
        constraints: (problem.constraints || []).join("\n"),
        exampleInput: example.input || "",
        exampleOutput: example.output || "",
        visibleTestsJson: JSON.stringify(problem.visibleTests || [], null, 2),
        hiddenTestsJson: JSON.stringify(problem.hiddenTests || [], null, 2),
        driverPreview: problem.driverPreview || "",
        published: Boolean(problem.published),
        allowedLanguages: problem.allowedLanguages?.length ? problem.allowedLanguages : languageOptions
      });
      setEditingId(id);
    } catch (e) {
      setMessage(e.message || "Failed to load problem");
    } finally {
      setLoadingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="-mx-6 -my-6 space-y-6 bg-slate-50 px-6 py-6 text-slate-900 dark:bg-slate-50 dark:text-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Manage Problems</h2>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} className="bg-slate-200 text-slate-800 hover:bg-slate-300">
            Download template
          </Button>
          <a
            href="/admin/problems/import"
            className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
          >
            Import from Excel
          </a>
        </div>
      </div>
      {message && <p className="text-sm text-red-600">{message}</p>}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {editingId ? "Edit problem" : "Create problem"}
            </h3>
            {editingId && <p className="text-xs text-slate-500">Editing {form.id}</p>}
          </div>
          <div className="flex items-center gap-2">
            {editingId && (
              <Button onClick={cancelEdit} className="bg-slate-200 text-slate-800 hover:bg-slate-300">
                Cancel edit
              </Button>
            )}
            <span className="text-xs text-slate-500">Admin-only</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-800">Problem id (optional)</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
              value={form.id}
              onChange={(e) => updateField("id", e.target.value)}
              placeholder="auto-generated from title"
              disabled={Boolean(editingId)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Title</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Two Sum"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Difficulty</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={form.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Allowed languages</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => toggleLanguage(lang.id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    form.allowedLanguages.includes(lang.id)
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-slate-800">Statement</label>
            <textarea
              className="mt-1 h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={form.statement}
              onChange={(e) => updateField("statement", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Constraints</label>
            <textarea
              className="mt-1 h-20 w-full rounded-md border px-3 py-2 text-sm"
              value={form.constraints}
              onChange={(e) => updateField("constraints", e.target.value)}
              placeholder="2 <= n <= 1e4; -1e9 <= nums[i] <= 1e9"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Example (single)</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={form.exampleInput}
              onChange={(e) => updateField("exampleInput", e.target.value)}
              placeholder="nums = [2,7,11,15], target = 9"
            />
            <input
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              value={form.exampleOutput}
              onChange={(e) => updateField("exampleOutput", e.target.value)}
              placeholder="[0,1]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-800">Visible tests (JSON array)</label>
              <button
                type="button"
                onClick={regenerateTests}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Regenerate dummy tests
              </button>
            </div>
            <textarea
              className="mt-1 h-24 w-full rounded-md border px-3 py-2 text-xs font-mono"
              value={form.visibleTestsJson}
              onChange={(e) => {
                setTestsTouched(true);
                updateField("visibleTestsJson", e.target.value);
              }}
              placeholder='[{"id":"pub1","input":"[2,7]|9","expectedOutput":"[0,1]","visibility":"public"}]'
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Hidden tests (JSON array)</label>
            <textarea
              className="mt-1 h-24 w-full rounded-md border px-3 py-2 text-xs font-mono"
              value={form.hiddenTestsJson}
              onChange={(e) => {
                setTestsTouched(true);
                updateField("hiddenTestsJson", e.target.value);
              }}
              placeholder='[{"id":"hid1","input":"[3,3]|6","expectedOutput":"[0,1]","visibility":"hidden"}]'
            />
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-800">Driver preview</label>
              <button
                type="button"
                onClick={regenerateDriver}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Regenerate driver
              </button>
            </div>
            <textarea
              className="mt-1 h-20 w-full rounded-md border px-3 py-2 text-xs font-mono"
              value={form.driverPreview}
              onChange={(e) => {
                setDriverTouched(true);
                updateField("driverPreview", e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            <label className="text-sm text-slate-700">Publish immediately</label>
          </div>
          <div className="flex items-center gap-2 justify-end lg:justify-start">
            <Button onClick={saveProblem} className="bg-emerald-600 hover:bg-emerald-500">
              {editingId ? "Save changes" : "Create problem"}
            </Button>
            <Button
              onClick={editingId ? cancelEdit : resetForm}
              className="bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              {editingId ? "Cancel" : "Reset"}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Only admins can access this page. Problems stay draft unless published.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">All problems</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Draft" },
              { id: "deleted", label: "Deleted" }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-full px-3 py-1 ${
                  filter === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Languages</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((p) => {
              const statusLabel = p.deleted ? "Deleted" : p.published ? "Published" : "Draft";
              const statusClass = p.deleted
                ? "bg-red-50 text-red-700"
                : p.published
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600";
              return (
                <tr key={p.id} className={`border-t ${p.deleted ? "bg-slate-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                  <td className="px-4 py-3 text-slate-600">{p.difficulty}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.allowedLanguages?.length ? p.allowedLanguages.join(", ") : "All"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${statusClass}`}>{statusLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                        onClick={() => startEdit(p.id)}
                        disabled={loadingEdit}
                      >
                        Edit
                      </Button>
                      <a
                        href={`/problems/${p.id}`}
                        className="rounded-md bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-slate-50"
                        title="Preview/Solve"
                      >
                        Preview
                      </a>
                      <Button
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100"
                        onClick={() => updateStatus(p.id, { deleted: !p.deleted })}
                      >
                        {p.deleted ? "Restore" : "Delete"}
                      </Button>
                      <Button
                        className="bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => updateStatus(p.id, { published: !p.published })}
                        disabled={p.deleted}
                      >
                        {p.published ? "Unpublish" : "Publish"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

