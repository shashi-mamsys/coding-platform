import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../ui/Button";
import { apiClient } from "../../services/apiClient";

export default function ProblemImportPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

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

  const onUpload = async () => {
    if (!file) return;
    setMessage("Uploading...");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/problems/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: form
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setMessage(`Imported: ${json.imported?.join(", ")}`);
    } catch (e) {
      setMessage(e.message);
    }
  };

  const downloadBlank = () => {
    const data = [
      [
        "id",
        "title",
        "difficulty",
        "statement",
        "constraints (semicolon separated)",
        "example_input",
        "example_output",
        "allowed_languages (comma separated)",
        "visible_tests_json",
        "hidden_tests_json"
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "problems");
    XLSX.writeFile(wb, "problem-template.xlsx");
  };

  return (
    <div className="-mx-6 -my-6 space-y-4 bg-slate-50 px-6 py-6 text-slate-900 dark:bg-slate-50 dark:text-slate-900">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Import problems from Excel</h2>
      <div className="flex gap-3">
        <Button onClick={downloadTemplate} className="bg-slate-200 text-slate-800 hover:bg-slate-300">
          Download template (from API)
        </Button>
        <Button onClick={downloadBlank} className="bg-slate-200 text-slate-800 hover:bg-slate-300">
          Download blank template (local)
        </Button>
      </div>
      <div className="space-y-2">
        <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={onUpload} className="bg-emerald-600 hover:bg-emerald-500">
          Upload
        </Button>
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
      <p className="text-xs text-slate-500">
        Columns: id (optional), title, difficulty, statement, constraints (semicolon-separated), example_input,
        example_output, allowed_languages (comma-separated), visible_tests_json, hidden_tests_json.
      </p>
      <p className="text-xs text-slate-500">
        Test input supports JSON arrays (recommended) or pipe-separated args (e.g. `[2,7]|9`).
      </p>
      </div>
    </div>
  );
}
