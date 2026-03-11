function parseJsonMaybe(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function parseSegment(segment) {
  if (!segment) return "";
  const eqIndex = segment.indexOf("=");
  const valuePart = eqIndex >= 0 ? segment.slice(eqIndex + 1).trim() : segment;
  return parseJsonMaybe(valuePart);
}

function parseArgs(input) {
  if (input === null || input === undefined) return [];
  if (typeof input !== "string") return [input];
  const trimmed = input.trim();
  if (!trimmed) return [];
  if (trimmed.includes("|")) {
    return trimmed.split("|").map((segment) => parseSegment(segment.trim()));
  }
  const parsed = parseJsonMaybe(trimmed);
  if (parsed !== trimmed) {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.args)) return parsed.args;
    return [parsed];
  }
  return [trimmed];
}

export function normalizeTests(tests = []) {
  return tests.map((t, idx) => ({
    id: t.id || `test-${idx + 1}`,
    visibility: t.visibility || "public",
    args: Array.isArray(t.args) ? t.args : t.args !== undefined ? [t.args] : parseArgs(t.input),
    expected: t.expected !== undefined ? t.expected : parseJsonMaybe(t.expectedOutput)
  }));
}
