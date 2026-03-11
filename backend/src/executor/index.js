import { run as runMock } from "./localMockExecutor.js";
import { run as runProcess, supportsLanguage as processSupports } from "./processExecutor.js";
import { canUseDocker, run as runDocker, supportsLanguage as dockerSupports } from "./dockerExecutor.js";

// Choose executor based on env; default to process for real execution.
export function selectExecutor(mode = process.env.EXECUTOR || "process") {
  if (mode === "docker" && canUseDocker()) return runDocker;
  if (mode === "process") return runProcess;
  return runMock;
}

function runUnsupported({ language }) {
  throw new Error(`Language not supported: ${language}`);
}

// Language-aware selection across available executors.
export function selectExecutorForLanguage(language) {
  const mode = process.env.EXECUTOR || "process";
  if (mode === "docker" && canUseDocker() && dockerSupports(language)) return runDocker;
  if (processSupports(language)) return runProcess;
  return runUnsupported;
}
