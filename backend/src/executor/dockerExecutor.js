import { spawn } from "node:child_process";
import { normalizeTests } from "./normalizeTests.js";

const IMAGE = process.env.EXECUTOR_IMAGE || "coding-platform-executor:local";
const TIMEOUT_MS = Number(process.env.MAX_EXECUTION_MS || 2000);

export function canUseDocker() {
  return !!process.env.USE_DOCKER;
}

export function supportsLanguage(language) {
  return language === "javascript";
}

export async function run({ language, code, tests }) {
  if (!supportsLanguage(language)) {
    throw new Error(`dockerExecutor only supports javascript for now`);
  }
  const payload = JSON.stringify({ code, tests: normalizeTests(tests) });

  const result = await new Promise((resolve, reject) => {
    const child = spawn("docker", ["run", "--rm", "-i", "--network", "none", IMAGE], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("execution timeout"));
    }, TIMEOUT_MS);

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(stderr || `executor exited ${code}`));
      resolve({ stdout, stderr });
    });

    child.stdin.write(payload);
    child.stdin.end();
  });

  const parsed = JSON.parse(result.stdout || "{}");
  return { results: parsed.results || [], stdout: result.stdout, stderr: result.stderr };
}
