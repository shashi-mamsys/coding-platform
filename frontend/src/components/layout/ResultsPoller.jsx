import { useEffect, useRef } from "react";
import { submissionService } from "../../services/submissionService";

const TERMINAL = ["passed", "failed"];

export default function ResultsPoller({ submissionId, mode, onResults, onStatus, onStdErr }) {
  const timer = useRef(null);

  useEffect(() => {
    if (!submissionId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await submissionService.get(submissionId);
        if (cancelled) return;
        onResults(res.results || []);
        onStatus(`Status: ${res.status}`);
        if (onStdErr) onStdErr(res.stderr || "");
        if (!TERMINAL.includes(res.status)) {
          timer.current = setTimeout(poll, 500);
        }
      } catch (e) {
        if (!cancelled) onStatus(e.message);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [submissionId, mode, onResults, onStatus, onStdErr]);

  return null;
}
