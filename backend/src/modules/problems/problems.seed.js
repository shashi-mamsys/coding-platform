import { ProblemModel } from "./problem.model.js";

export async function seedProblems() {
  const count = await ProblemModel.estimatedDocumentCount();
  if (count > 0) return;
  await ProblemModel.create({
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution exists.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9", "Exactly one valid pair exists"],
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
    visibleTests: [{ id: "public-1", input: "[2,7,11,15]|9", expectedOutput: "[0,1]", visibility: "public" }],
    hiddenTests: [{ id: "hidden-1", input: "[3,3]|6", expectedOutput: "[0,1]", visibility: "hidden" }],
    allowedLanguages: ["javascript", "python"],
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
    ].join("\n"),
    published: true,
    deleted: false
  });
}
