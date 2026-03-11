import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { normalizeTests } from "./normalizeTests.js";

const DEFAULT_TIMEOUT_MS = Number(process.env.MAX_EXECUTION_MS || 2000);

export function supportsLanguage(language) {
  return language === "javascript" || language === "python";
}

function buildJsHarness(code, tests) {
  return `
${code}

// Resolve solve function
let solveRef = global.solve || (typeof solve !== "undefined" ? solve : undefined);
if (!solveRef && typeof module !== "undefined" && module.exports && module.exports.solve) solveRef = module.exports.solve;
if (!solveRef && typeof exports !== "undefined" && exports.solve) solveRef = exports.solve;
if (!solveRef && typeof Solution !== "undefined") solveRef = (...args) => new Solution().solve(...args);
if (!solveRef) throw new Error("solve function not found");

const tests = ${JSON.stringify(tests)};

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function run() {
  const results = [];
  let stderr = "";
  for (const t of tests) {
    try {
      const args = Array.isArray(t.args) ? t.args : [t.args];
      const out = await solveRef(...args);
      const passed = deepEqual(out, t.expected);
      results.push({ testId: t.id, visibility: t.visibility, status: passed ? "passed" : "failed" });
    } catch (err) {
      stderr = String(err);
      results.push({ testId: t.id, visibility: t.visibility, status: "error", message: String(err) });
    }
  }
  console.log("__RESULTS__" + JSON.stringify({ results, stderr }));
}
run();
`;
}

function buildPythonRunner() {
  return `
import json
import importlib.util

def load_solution(path):
    spec = importlib.util.spec_from_file_location("solution", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if hasattr(module, "solve"):
        return module.solve
    if hasattr(module, "Solution"):
        instance = module.Solution()
        if hasattr(instance, "solve"):
            return instance.solve
    raise Exception("solve function not found")

def stable_json(value):
    return json.dumps(value, separators=(",", ":"), ensure_ascii=True)

def main():
    with open("tests.json", "r", encoding="utf-8") as f:
        tests = json.load(f)
    solve = load_solution("solution.py")
    results = []
    stderr = ""
    for t in tests:
        try:
            args = t.get("args", [])
            if not isinstance(args, list):
                args = [args]
            out = solve(*args)
            passed = stable_json(out) == stable_json(t.get("expected"))
            results.append({
                "testId": t.get("id"),
                "visibility": t.get("visibility", "public"),
                "status": "passed" if passed else "failed"
            })
        except Exception as e:
            stderr = str(e)
            results.append({
                "testId": t.get("id"),
                "visibility": t.get("visibility", "public"),
                "status": "error",
                "message": str(e)
            })
    print("__RESULTS__" + json.dumps({ "results": results, "stderr": stderr }))

if __name__ == "__main__":
    main()
`;
}

export async function run({ language, code, tests }) {
  if (!supportsLanguage(language)) {
    throw new Error(`processExecutor does not support ${language}`);
  }

  const normalizedTests = normalizeTests(tests);
  const dir = await mkdtemp(join(tmpdir(), "exec-"));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    if (language === "javascript") {
      const file = join(dir, "runner.mjs");
      await writeFile(file, buildJsHarness(code, normalizedTests), "utf-8");
      const output = await execCommand(process.execPath, [file], controller.signal, dir);
      return parseResults(output);
    }
    if (language === "python") {
      await writeFile(join(dir, "solution.py"), code, "utf-8");
      await writeFile(join(dir, "tests.json"), JSON.stringify(normalizedTests), "utf-8");
      await writeFile(join(dir, "runner.py"), buildPythonRunner(), "utf-8");
      const output = await execPython(["runner.py"], controller.signal, dir);
      return parseResults(output);
    }
    throw new Error(`Unsupported language ${language}`);
  } finally {
    clearTimeout(timeout);
    await rm(dir, { recursive: true, force: true });
  }
}

function parseResults(output) {
  const marker = "__RESULTS__";
  const index = output.lastIndexOf(marker);
  if (index === -1) {
    return { results: [], stdout: output, stderr: "executor output missing results marker" };
  }
  const payload = output.slice(index + marker.length);
  try {
    const parsed = JSON.parse(payload.trim());
    return {
      results: parsed.results || [],
      stdout: output,
      stderr: parsed.stderr || ""
    };
  } catch (err) {
    return { results: [], stdout: output, stderr: `failed to parse results: ${err}` };
  }
}

function execPython(args, signal, cwd) {
  return execCommand("python", args, signal, cwd).catch((err) => {
    if (err && err.code === "ENOENT") {
      return execCommand("python3", args, signal, cwd);
    }
    throw err;
  });
}

function execCommand(command, args, signal, cwd) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], signal, cwd });
    child.stdout.on("data", (d) => chunks.push(d));
    child.stderr.on("data", (d) => chunks.push(d));
    child.on("error", reject);
    child.on("exit", (code, signalExit) => {
      const output = Buffer.concat(chunks).toString("utf-8");
      if (signalExit === "SIGABRT" || code !== 0) {
        const err = new Error(`execution failed (${signalExit || code}): ${output}`);
        err.code = code;
        return reject(err);
      }
      resolve(output);
    });
  });
}
