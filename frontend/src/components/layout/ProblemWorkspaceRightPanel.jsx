import { FaPause, FaPlay, FaStopwatch, FaUpload } from "react-icons/fa";
import { formatTime } from "../../utils/helpers";
import { Button } from "../ui/Button";
import ResultsPoller from "./ResultsPoller";

const BOTTOM_TABS = [
  { id: "testcase", label: "Testcase" },
  { id: "results", label: "Result" }
];

export default function ProblemWorkspaceRightPanel({
  rightRef,
  topBarRef,
  bottomTabsRef,
  editorHeight,
  resultsHeight,
  isBottomCollapsed,
  onExpandBottom,
  language,
  setLanguage,
  availableLanguages,
  secondsLeft,
  isActive,
  pause,
  resume,
  reset,
  submit,
  code,
  setCode,
  bottomTab,
  setBottomTab,
  problem,
  activeTestId,
  setActiveTestId,
  activeTest,
  results,
  stderr,
  statusMessage,
  submissionId,
  mode,
  onResults,
  onStatus,
  onStdErr,
  onStartHorizontalDrag
}) {
  return (
    <section
      ref={rightRef}
      className="flex h-[calc(100vh-9rem)] flex-1 flex-col rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:min-w-[520px]"
    >
      <div ref={topBarRef} className="flex items-center justify-between border-b px-4 py-2 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Code</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {availableLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            {language === "python" ? "solution.py" : "solution.js"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <FaStopwatch className="text-slate-500 dark:text-slate-400" />
            <span>{formatTime(secondsLeft)}</span>
            <button
              onClick={isActive ? pause : resume}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              aria-label={isActive ? "Pause timer" : "Resume timer"}
            >
              {isActive ? <FaPause /> : <FaPlay />}
            </button>
            <button
              onClick={reset}
              className="text-slate-600 hover:text-slate-900 text-[10px] dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Reset timer"
            >
              reset
            </button>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
            disabled={!isActive || secondsLeft === 0}
            onClick={() => submit("run")}
          >
            <FaPlay />
            <span className="ml-2">Run</span>
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60"
            disabled={!isActive || secondsLeft === 0}
            onClick={() => submit("submit")}
          >
            <FaUpload />
            <span className="ml-2">Submit</span>
          </Button>
        </div>
      </div>
      <div className="p-3" style={{ height: editorHeight }}>
        <textarea
          className="h-full w-full resize-none rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 font-mono text-sm text-slate-100 focus:border-slate-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div
        className={`flex h-3 cursor-row-resize items-center justify-center ${isBottomCollapsed ? "hidden" : ""}`}
        role="separator"
        aria-orientation="horizontal"
        onMouseDown={onStartHorizontalDrag}
      >
        <div className="h-1.5 w-16 rounded-full bg-slate-200" />
      </div>
      <ResultsPoller submissionId={submissionId} mode={mode} onResults={onResults} onStatus={onStatus} onStdErr={onStdErr} />
      <div className="border-t dark:border-slate-800">
        <div
          ref={bottomTabsRef}
          className={`flex items-center gap-2 border-b px-4 py-2 dark:border-slate-800 ${
            isBottomCollapsed ? "cursor-pointer" : ""
          }`}
          onClick={isBottomCollapsed ? onExpandBottom : undefined}
          role={isBottomCollapsed ? "button" : undefined}
          aria-expanded={!isBottomCollapsed}
          tabIndex={isBottomCollapsed ? 0 : undefined}
          onKeyDown={
            isBottomCollapsed
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") onExpandBottom();
                }
              : undefined
          }
        >
          {BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBottomTab(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                bottomTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {!isBottomCollapsed && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Input supports JSON arrays or pipe-separated values.
            </span>
          )}
        </div>
        <div
          className={`overflow-auto px-4 py-3 text-sm text-slate-700 dark:text-slate-200 ${
            isBottomCollapsed ? "hidden" : ""
          }`}
          style={isBottomCollapsed ? undefined : { height: resultsHeight }}
        >
          {bottomTab === "testcase" && (
            <div className="space-y-3">
              {!problem?.visibleTests?.length && <p>No public tests available.</p>}
              {problem?.visibleTests?.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    {problem.visibleTests.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTestId(t.id)}
                        className={`rounded-full px-3 py-1 text-xs ${
                          activeTestId === t.id
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {t.id}
                      </button>
                    ))}
                  </div>
                  {activeTest && (
                    <div className="rounded-lg border bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      <div>Input: {activeTest.input}</div>
                      <div>Expected: {activeTest.expectedOutput}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {bottomTab === "results" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">{statusMessage || "No results yet."}</p>
              {stderr && (
                <pre className="rounded bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                  {stderr}
                </pre>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {results.length === 0 && (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    No results yet
                  </div>
                )}
                {results.map((r) => (
                  <div
                    key={r.testId}
                    className={`rounded-lg px-3 py-2 ${
                      r.status === "passed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                    }`}
                  >
                    {r.testId}: {r.status} ({r.visibility})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
