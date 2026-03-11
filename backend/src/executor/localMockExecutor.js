// Mock executor; replace with sandboxed runner (e.g., Docker) later.
// Signature: run({ language, code, tests }) -> { results, stdout, stderr }
export async function run({ language, code, tests }) {
  console.log(`[executor] Running ${language} with ${tests.length} tests (mock)`);
  await new Promise((r) => setTimeout(r, 300));
  return {
    stdout: "",
    stderr: "",
    results: tests.map((t) => ({
      testId: t.id,
      visibility: t.visibility,
      status: "passed",
      runtimeMs: 12
    }))
  };
}
