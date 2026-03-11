export const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    published: true,
    visibleTests: [
      { id: "public-1", input: "[2,7,11,15]|9", expectedOutput: "[0,1]", visibility: "public" }
    ],
    hiddenTests: [
      { id: "hidden-1", input: "[3,3]|6", expectedOutput: "[0,1]", visibility: "hidden" }
    ],
    driverPreview: [
      "import { solve } from './solution'",
      "import cases from './hidden-tests.json'",
      "",
      "for (const c of cases) {",
      "  const [rawNums, rawTarget] = c.input.split('|')",
      "  const nums = JSON.parse(rawNums)",
      "  const target = Number(rawTarget)",
      "  const result = solve(nums, target)",
      "  if (JSON.stringify(result) !== c.expectedOutput) {",
      "    throw new Error(`Mismatch for ${c.id}`)",
      "  }",
      "}"
    ].join("\\n")
  }
];
