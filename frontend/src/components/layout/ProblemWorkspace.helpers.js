function splitTopLevel(input, delimiter) {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = "";
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      current += ch;
      if (ch === quote && input[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "[" || ch === "{" || ch === "(") depth += 1;
    if (ch === "]" || ch === "}" || ch === ")") depth = Math.max(0, depth - 1);
    if (ch === delimiter && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function sanitizeParam(name, index, used) {
  const cleaned = String(name || "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .trim();
  let base = cleaned && !/^\d/.test(cleaned) ? cleaned : `arg${index + 1}`;
  if (!base) base = `arg${index + 1}`;
  if (used.has(base)) {
    let suffix = 2;
    while (used.has(`${base}_${suffix}`)) suffix += 1;
    base = `${base}_${suffix}`;
  }
  used.add(base);
  return base;
}

export function inferParamsFromInput(raw) {
  const input = String(raw || "").trim();
  if (!input) return ["input"];
  const used = new Set();
  if (input.includes("|")) {
    const segments = splitTopLevel(input, "|");
    if (segments.length > 0) {
      return segments.map((segment, idx) => {
        const eqIndex = segment.indexOf("=");
        const left = eqIndex >= 0 ? segment.slice(0, eqIndex).trim() : "";
        const match = left.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
        return sanitizeParam(match ? match[0] : "", idx, used);
      });
    }
  }
  const segments = splitTopLevel(input, ",");
  const names = [];
  segments.forEach((segment) => {
    const eqIndex = segment.indexOf("=");
    if (eqIndex >= 0) {
      const left = segment.slice(0, eqIndex).trim();
      const match = left.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
      if (match) names.push(match[0]);
    }
  });
  if (names.length > 0) {
    return names.map((name, idx) => sanitizeParam(name, idx, used));
  }
  if (segments.length > 1) {
    return segments.map((_, idx) => sanitizeParam("", idx, used));
  }
  const semiSegments = splitTopLevel(input, ";");
  if (semiSegments.length > 1) {
    return semiSegments.map((_, idx) => sanitizeParam("", idx, used));
  }
  return ["input"];
}
