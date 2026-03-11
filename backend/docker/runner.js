import { readFileSync } from "node:fs";

async function main() {
  const payload = JSON.parse(readFileSync(0, "utf-8"));
  const { code, tests } = payload;

  // eslint-disable-next-line no-eval
  eval(code);

  const results = [];
  for (const t of tests) {
    try {
      const args = Array.isArray(t.args) ? t.args : [t.args];
      const out = await global.solve(...args);
      const passed = JSON.stringify(out) === JSON.stringify(t.expected);
      results.push({ testId: t.id, visibility: t.visibility, status: passed ? "passed" : "failed" });
    } catch (err) {
      results.push({ testId: t.id, visibility: t.visibility, status: "error", message: String(err) });
    }
  }

  process.stdout.write(JSON.stringify({ results }));
}

main().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
