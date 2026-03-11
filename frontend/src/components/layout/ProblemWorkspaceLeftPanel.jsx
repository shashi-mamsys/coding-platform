const LEFT_TABS = [
  { id: "description", label: "Description" },
  { id: "solutions", label: "Solutions", disabled: true },
  { id: "submissions", label: "Submissions" }
];

function DescriptionTab({ problem, authLoading, user }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Problem</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{problem?.title}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{problem?.id}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          {problem?.difficulty || "easy"}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{problem?.statement}</p>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Constraints</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
          {problem?.constraints?.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Examples</p>
        <div className="mt-2 space-y-3">
          {problem?.examples?.map((ex) => (
            <div
              key={ex.input}
              className="rounded-lg border bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <div>Input: {ex.input}</div>
              <div>Output: {ex.output}</div>
              {ex.explanation && <div>Explanation: {ex.explanation}</div>}
            </div>
          ))}
        </div>
      </div>
      {!authLoading && user?.role === "admin" && (
        <div className="rounded-lg border border-dashed bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Runner code</p>
          {authLoading && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Loading...</p>}
          <pre className="mt-2 overflow-auto text-xs text-slate-800 dark:text-slate-100">
            {problem?.driverPreview || "Runner preview not available"}
          </pre>
        </div>
      )}
    </div>
  );
}

function SubmissionsTab({
  submissionError,
  submissionLoading,
  submissionList,
  selectedSubmissionId,
  selectedSubmission,
  submissionDetailLoading,
  refreshSubmissions,
  openSubmission
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Submissions</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">Your submissions for this problem</p>
        </div>
        <button
          type="button"
          onClick={refreshSubmissions}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Refresh
        </button>
      </div>
      {submissionError && <p className="text-sm text-rose-600">{submissionError}</p>}
      {submissionLoading && <p className="text-sm text-slate-600 dark:text-slate-300">Loading...</p>}
      {!submissionLoading && !submissionError && submissionList.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-300">No submissions yet.</p>
      )}
      {submissionList.length > 0 && (
        <div className="overflow-hidden rounded-lg border dark:border-slate-800">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Lang</th>
                <th className="px-3 py-2">Passed</th>
              </tr>
            </thead>
            <tbody>
              {submissionList.map((s) => (
                <tr
                  key={s.id}
                  className={`border-t ${
                    selectedSubmissionId === s.id
                      ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => openSubmission(s.id)}
                      className="text-left text-slate-700 hover:text-emerald-700 dark:text-slate-200"
                    >
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 ${
                        s.status === "passed"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : s.status === "failed"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{s.language}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                    {typeof s.passedCount === "number" && typeof s.totalCount === "number"
                      ? `${s.passedCount}/${s.totalCount}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="rounded-lg border bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Submitted code</p>
        {submissionDetailLoading && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Loading code...</p>}
        {!submissionDetailLoading && !selectedSubmission && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Select a submission to view the code.</p>
        )}
        {!submissionDetailLoading && selectedSubmission && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>Status: {selectedSubmission.status}</span>
              {typeof selectedSubmission.passedCount === "number" &&
                typeof selectedSubmission.totalCount === "number" && (
                  <span>
                    Passed: {selectedSubmission.passedCount}/{selectedSubmission.totalCount}
                  </span>
                )}
              <span>Language: {selectedSubmission.language}</span>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md bg-slate-900 px-3 py-3 text-xs text-slate-100">
{selectedSubmission.code || "// No code stored"}
            </pre>
            {selectedSubmission.stderr && (
              <pre className="rounded bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
{selectedSubmission.stderr}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProblemWorkspaceLeftPanel({
  leftStyle,
  leftTab,
  setLeftTab,
  problem,
  authLoading,
  user,
  refreshSubmissions,
  submissionError,
  submissionLoading,
  submissionList,
  selectedSubmissionId,
  selectedSubmission,
  submissionDetailLoading,
  openSubmission
}) {
  return (
    <section
      className="flex h-[calc(100vh-9rem)] flex-col rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:min-w-[360px] lg:shrink-0"
      style={leftStyle}
    >
      <div className="flex items-center gap-2 border-b px-4 py-2 dark:border-slate-800">
        {LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setLeftTab(tab.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab.disabled
                ? "cursor-not-allowed text-slate-400"
                : leftTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-5 py-4">
        {leftTab === "solutions" && (
          <div className="rounded-lg border border-dashed bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Coming soon.
          </div>
        )}
        {leftTab === "description" && (
          <DescriptionTab problem={problem} authLoading={authLoading} user={user} />
        )}
        {leftTab === "submissions" && (
          <SubmissionsTab
            submissionError={submissionError}
            submissionLoading={submissionLoading}
            submissionList={submissionList}
            selectedSubmissionId={selectedSubmissionId}
            selectedSubmission={selectedSubmission}
            submissionDetailLoading={submissionDetailLoading}
            refreshSubmissions={refreshSubmissions}
            openSubmission={openSubmission}
          />
        )}
      </div>
    </section>
  );
}
