import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES } from "../../utils/constants";
import { useTimer } from "../../hooks/useTimer";
import { submissionService } from "../../services/submissionService";
import { useAuthContext } from "../../app/providers/authProvider";
import ProblemWorkspaceLeftPanel from "./ProblemWorkspaceLeftPanel";
import ProblemWorkspaceRightPanel from "./ProblemWorkspaceRightPanel";
import { inferParamsFromInput } from "./ProblemWorkspace.helpers";

// Runner code is intentionally hidden from users.

export default function ProblemWorkspace({ problem }) {
  const MIN_LEFT_WIDTH = 360;
  const MIN_RIGHT_WIDTH = 520;
  const SPLITTER_WIDTH = 8;
  const GAP_WIDTH = 16;
  const DEFAULT_EDITOR_RATIO = 0.62;
  const COLLAPSE_THRESHOLD = 32;
  const [language, setLanguage] = useState(LANGUAGES[0]?.id || "javascript");
  const { secondsLeft, isActive, pause, resume, reset } = useTimer(problem?.id || "problem");
  const { user, loading: authLoading } = useAuthContext();
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const [mode, setMode] = useState("run");
  const [stderr, setStderr] = useState("");
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");
  const [activeTestId, setActiveTestId] = useState("");
  const [submissionList, setSubmissionList] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetailLoading, setSubmissionDetailLoading] = useState(false);
  const [submissionRefresh, setSubmissionRefresh] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [leftRatio, setLeftRatio] = useState(() => {
    const stored = Number(localStorage.getItem("workspace:leftRatio"));
    return Number.isFinite(stored) && stored > 0 ? stored : 0.42;
  });
  const [editorRatio, setEditorRatio] = useState(() => {
    const stored = Number(localStorage.getItem("workspace:editorRatio"));
    return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_EDITOR_RATIO;
  });
  const mainRef = useRef(null);
  const rightRef = useRef(null);
  const topBarRef = useRef(null);
  const bottomTabsRef = useRef(null);
  const dragRef = useRef(null);
  const lastExpandedEditorRatioRef = useRef(DEFAULT_EDITOR_RATIO);

  useEffect(() => {
    const first = problem?.visibleTests?.[0]?.id || "";
    setActiveTestId(first);
  }, [problem?.id, problem?.visibleTests]);

  const refreshSubmissions = () => setSubmissionRefresh((value) => value + 1);

  useEffect(() => {
    if (leftTab !== "submissions") return;
    if (authLoading) return;
    if (!user) {
      setSubmissionList([]);
      setSelectedSubmission(null);
      setSelectedSubmissionId(null);
      setSubmissionError("Please sign in to view submissions.");
      return;
    }
    if (!problem?.id) return;
    let active = true;
    const load = async () => {
      setSubmissionLoading(true);
      setSubmissionError("");
      try {
        const res = await submissionService.list(problem.id);
        if (!active) return;
        const list = Array.isArray(res) ? res : [];
        setSubmissionList(list);
        setSelectedSubmission(null);
        setSelectedSubmissionId(null);
      } catch (e) {
        if (!active) return;
        setSubmissionError(e.message || "Failed to load submissions");
      } finally {
        if (active) setSubmissionLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [leftTab, problem?.id, user, authLoading, submissionRefresh]);

  const openSubmission = async (id) => {
    if (!id) return;
    setSelectedSubmissionId(id);
    setSubmissionDetailLoading(true);
    setSubmissionError("");
    try {
      const res = await submissionService.get(id);
      setSelectedSubmission(res);
    } catch (e) {
      setSubmissionError(e.message || "Failed to load submission");
    } finally {
      setSubmissionDetailLoading(false);
    }
  };

  const activeTest = useMemo(() => {
    if (!problem?.visibleTests?.length) return null;
    return problem.visibleTests.find((t) => t.id === activeTestId) || problem.visibleTests[0];
  }, [problem?.visibleTests, activeTestId]);

  const availableLanguages = useMemo(() => {
    const allowed = problem?.allowedLanguages?.length ? problem.allowedLanguages : LANGUAGES.map((l) => l.id);
    return LANGUAGES.filter((lang) => allowed.includes(lang.id));
  }, [problem?.allowedLanguages]);

  useEffect(() => {
    if (!availableLanguages.find((lang) => lang.id === language)) {
      setLanguage(availableLanguages[0]?.id || "javascript");
    }
  }, [availableLanguages, language]);

  const exampleInput = problem?.examples?.[0]?.input || problem?.visibleTests?.[0]?.input || "";
  const starterCode = useMemo(() => {
    const params = inferParamsFromInput(exampleInput);
    const signature = params.join(", ") || "input";
    if (language === "python") {
      return `def solve(${signature}):\n    # TODO: implement\n    return ${params[0] || "None"}`;
    }
    return `export const solve = (${signature}) => {\n  // TODO: implement\n  return ${params[0] || "null"};\n};`;
  }, [language, exampleInput]);
  const [code, setCode] = useState(starterCode);

  useEffect(() => {
    setCode(starterCode);
  }, [starterCode]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handle = () => setIsWide(mq.matches);
    handle();
    if (mq.addEventListener) mq.addEventListener("change", handle);
    else mq.addListener(handle);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handle);
      else mq.removeListener(handle);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("workspace:leftRatio", String(leftRatio));
  }, [leftRatio]);

  useEffect(() => {
    localStorage.setItem("workspace:editorRatio", String(editorRatio));
    if (!isBottomCollapsed) lastExpandedEditorRatioRef.current = editorRatio;
  }, [editorRatio, isBottomCollapsed]);

  useEffect(() => {
    const onMove = (event) => {
      if (!dragRef.current) return;
      if (dragRef.current.type === "vertical" && mainRef.current && isWide) {
        const rect = mainRef.current.getBoundingClientRect();
        const availableWidth = Math.max(0, rect.width - SPLITTER_WIDTH - GAP_WIDTH * 2);
        const maxLeft = Math.max(MIN_LEFT_WIDTH, availableWidth - MIN_RIGHT_WIDTH);
        const rawLeft = event.clientX - rect.left;
        const nextLeft = Math.min(Math.max(rawLeft, MIN_LEFT_WIDTH), maxLeft);
        setLeftRatio(nextLeft / Math.max(availableWidth, 1));
      }
      if (dragRef.current.type === "horizontal" && rightRef.current) {
        const rightRect = rightRef.current.getBoundingClientRect();
        const topBarHeight = topBarRef.current?.offsetHeight || 0;
        const bottomTabsHeight = bottomTabsRef.current?.offsetHeight || 0;
        const available = rightRect.height - topBarHeight - bottomTabsHeight - 12;
        const minEditor = 180;
        const maxEditor = Math.max(minEditor + 60, available - COLLAPSE_THRESHOLD);
        const nextEditor = Math.min(Math.max(event.clientY - rightRect.top - topBarHeight, minEditor), maxEditor);
        const nextResults = available - nextEditor;
        if (nextResults <= COLLAPSE_THRESHOLD) {
          if (!isBottomCollapsed) setIsBottomCollapsed(true);
          return;
        }
        if (isBottomCollapsed) setIsBottomCollapsed(false);
        setEditorRatio(nextEditor / Math.max(available, 1));
      }
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isWide, isBottomCollapsed]);

  const submit = async (nextMode) => {
    setMode(nextMode);
    setSubmissionId(null);
    setResults([]);
    setStderr("");
    setBottomTab("results");
    setStatusMessage(nextMode === "run" ? "Running..." : "Submitting for full evaluation...");
    try {
      const submission = await submissionService.create({
        problemId: problem?.id,
        language,
        code,
        mode: nextMode
      });
      if (nextMode === "run" || !submission?.id) {
        setResults(submission.results || []);
        setStderr(submission.stderr || "");
        if (typeof submission.passedCount === "number" && typeof submission.totalCount === "number") {
          setStatusMessage(`Run ${submission.status || "done"}: ${submission.passedCount}/${submission.totalCount} passed`);
        } else {
          setStatusMessage(`Run ${submission.status || "done"}`);
        }
      } else {
        setSubmissionId(submission.id);
        setStatusMessage(`Submission queued (${submission.id})`);
      }
    } catch (e) {
      setStatusMessage(e.message);
    }
  };

  const startVerticalDrag = (event) => {
    event.preventDefault();
    dragRef.current = { type: "vertical" };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startHorizontalDrag = (event) => {
    event.preventDefault();
    if (isBottomCollapsed) {
      setIsBottomCollapsed(false);
      setEditorRatio(lastExpandedEditorRatioRef.current || DEFAULT_EDITOR_RATIO);
    }
    dragRef.current = { type: "horizontal" };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };
  const expandBottom = () => {
    if (!isBottomCollapsed) return;
    setIsBottomCollapsed(false);
    setEditorRatio(lastExpandedEditorRatioRef.current || DEFAULT_EDITOR_RATIO);
  };

  const mainWidth = mainRef.current?.clientWidth || 0;
  const availableWidth = Math.max(0, mainWidth - SPLITTER_WIDTH - GAP_WIDTH * 2);
  const maxLeftWidth = Math.max(MIN_LEFT_WIDTH, availableWidth - MIN_RIGHT_WIDTH);
  const leftWidth = Math.min(Math.max(MIN_LEFT_WIDTH, Math.round(availableWidth * leftRatio || 0)), maxLeftWidth);
  const rightHeight = rightRef.current?.clientHeight || 0;
  const topBarHeight = topBarRef.current?.offsetHeight || 0;
  const bottomTabsHeight = bottomTabsRef.current?.offsetHeight || 0;
  const splitterHeight = isBottomCollapsed ? 0 : 12;
  const availableEditor = Math.max(0, rightHeight - topBarHeight - bottomTabsHeight - splitterHeight);
  const editorHeight = isBottomCollapsed
    ? Math.max(180, availableEditor)
    : Math.max(180, Math.min(availableEditor * editorRatio, Math.max(180, availableEditor - COLLAPSE_THRESHOLD)));
  const resultsHeight = isBottomCollapsed ? 0 : Math.max(COLLAPSE_THRESHOLD, availableEditor - editorHeight);
  const leftStyle = isWide ? { width: leftWidth } : undefined;

  return (
    <main ref={mainRef} className="flex flex-col gap-4 lg:flex-row">
      <ProblemWorkspaceLeftPanel
        leftStyle={leftStyle}
        leftTab={leftTab}
        setLeftTab={setLeftTab}
        problem={problem}
        authLoading={authLoading}
        user={user}
        refreshSubmissions={refreshSubmissions}
        submissionError={submissionError}
        submissionLoading={submissionLoading}
        submissionList={submissionList}
        selectedSubmissionId={selectedSubmissionId}
        selectedSubmission={selectedSubmission}
        submissionDetailLoading={submissionDetailLoading}
        openSubmission={openSubmission}
      />

      <div
        className="hidden h-[calc(100vh-9rem)] w-2 cursor-col-resize items-center justify-center lg:flex"
        role="separator"
        aria-orientation="vertical"
        onMouseDown={startVerticalDrag}
      >
        <div className="h-14 w-1.5 rounded-full bg-slate-200" />
      </div>

      <ProblemWorkspaceRightPanel
        rightRef={rightRef}
        topBarRef={topBarRef}
        bottomTabsRef={bottomTabsRef}
        editorHeight={editorHeight}
        resultsHeight={resultsHeight}
        isBottomCollapsed={isBottomCollapsed}
        onExpandBottom={expandBottom}
        language={language}
        setLanguage={setLanguage}
        availableLanguages={availableLanguages}
        secondsLeft={secondsLeft}
        isActive={isActive}
        pause={pause}
        resume={resume}
        reset={reset}
        submit={submit}
        code={code}
        setCode={setCode}
        bottomTab={bottomTab}
        setBottomTab={setBottomTab}
        problem={problem}
        activeTestId={activeTestId}
        setActiveTestId={setActiveTestId}
        activeTest={activeTest}
        results={results}
        stderr={stderr}
        statusMessage={statusMessage}
        submissionId={submissionId}
        mode={mode}
        onResults={setResults}
        onStatus={setStatusMessage}
        onStdErr={setStderr}
        onStartHorizontalDrag={startHorizontalDrag}
      />
    </main>
  );
}
