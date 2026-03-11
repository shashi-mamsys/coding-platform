import { Router } from "express";
import { asyncHandler, ok } from "../../utils/helpers.js";
import { ProblemModel } from "./problem.model.js";
import multer from "multer";
import ExcelJS from "exceljs";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { optionalAuth } from "../../middleware/optionalAuth.middleware.js";
import { SUPPORTED_LANGUAGES } from "../../constants/languages.js";

const upload = multer({ storage: multer.memoryStorage() });

export const problemsRouter = Router();

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueId(title, reservedIds = new Set()) {
  const base = slugify(title) || "problem";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    if (reservedIds.has(candidate)) {
      suffix += 1;
      continue;
    }
    const exists = await ProblemModel.exists({ id: candidate });
    if (!exists) {
      reservedIds.add(candidate);
      return candidate;
    }
    suffix += 1;
  }
}

problemsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? {} : { published: true, deleted: { $ne: true } };
    const problems = await ProblemModel.find(filter)
      .select("id title difficulty published allowedLanguages deleted updatedAt")
      .lean();
    return ok(res, problems);
  })
);

problemsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === "admin";
    const problem = await ProblemModel.findOne({ id: req.params.id }).lean();
    if (!problem || (problem.deleted && !isAdmin) || (!problem.published && !isAdmin)) {
      return res.status(404).json({ error: "Problem not found" });
    }
    if (isAdmin) return ok(res, problem);
    const hiddenTests = problem.hiddenTests?.map(({ id, visibility }) => ({ id, visibility })) || [];
    return ok(res, { ...problem, hiddenTests, hiddenTestCount: hiddenTests.length });
  })
);

problemsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const title = String(body.title || "").trim();
    if (!title) return res.status(400).json({ error: "title required" });
    let id = String(body.id || "").trim();
    if (!id) {
      id = await generateUniqueId(title);
    } else {
      const existing = await ProblemModel.findOne({ id });
      if (existing) return res.status(409).json({ error: "Problem id exists" });
    }
    const allowedLanguagesInput = Array.isArray(body.allowedLanguages) ? body.allowedLanguages : [];
    const allowedLanguages = allowedLanguagesInput.filter((lang) => SUPPORTED_LANGUAGES.includes(lang));
    const resolvedLanguages = allowedLanguages.length > 0 ? allowedLanguages : SUPPORTED_LANGUAGES;
    const problem = await ProblemModel.create({
      id,
      title,
      difficulty: body.difficulty || "easy",
      statement: body.statement || "",
      constraints: body.constraints || [],
      examples: body.examples || [],
      visibleTests: body.visibleTests || [],
      hiddenTests: body.hiddenTests || [],
      driverPreview: body.driverPreview || "",
      allowedLanguages: resolvedLanguages,
      published: Boolean(body.published),
      deleted: false
    });
    return ok(res, problem, 201);
  })
);

problemsRouter.patch(
  "/:id/publish",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const current = await ProblemModel.findOne({ id: req.params.id }).lean();
    if (!current) return res.status(404).json({ error: "Problem not found" });
    if (current.deleted) return res.status(400).json({ error: "Cannot publish a deleted problem" });
    const problem = await ProblemModel.findOneAndUpdate(
      { id: req.params.id },
      { published: Boolean(req.body.published) },
      { new: true }
    ).lean();
    return ok(res, { id: problem.id, published: problem.published });
  })
);

problemsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const update = {};

    if (body.title !== undefined) update.title = body.title;
    if (body.statement !== undefined) update.statement = body.statement;
    if (body.difficulty !== undefined) update.difficulty = body.difficulty;
    if (body.constraints !== undefined) update.constraints = Array.isArray(body.constraints) ? body.constraints : [];
    if (body.examples !== undefined) update.examples = Array.isArray(body.examples) ? body.examples : [];
    if (body.visibleTests !== undefined)
      update.visibleTests = Array.isArray(body.visibleTests) ? body.visibleTests : [];
    if (body.hiddenTests !== undefined)
      update.hiddenTests = Array.isArray(body.hiddenTests) ? body.hiddenTests : [];
    if (body.driverPreview !== undefined) update.driverPreview = body.driverPreview;

    if (body.allowedLanguages !== undefined) {
      const allowedLanguagesInput = Array.isArray(body.allowedLanguages) ? body.allowedLanguages : [];
      const allowedLanguages = allowedLanguagesInput.filter((lang) => SUPPORTED_LANGUAGES.includes(lang));
      update.allowedLanguages = allowedLanguages.length > 0 ? allowedLanguages : SUPPORTED_LANGUAGES;
    }

    if (body.published !== undefined) update.published = Boolean(body.published);
    if (body.deleted !== undefined) update.deleted = Boolean(body.deleted);
    if (update.deleted) update.published = false;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const current = await ProblemModel.findOne({ id: req.params.id }).lean();
    if (!current) return res.status(404).json({ error: "Problem not found" });
    if (current.deleted && update.published === true) {
      return res.status(400).json({ error: "Restore a deleted problem before publishing" });
    }

    const problem = await ProblemModel.findOneAndUpdate({ id: req.params.id }, { $set: update }, { new: true }).lean();
    return ok(res, problem);
  })
);

problemsRouter.get(
  "/template",
  asyncHandler(async (_req, res) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("problems");
    ws.addRow([
      "id",
      "title",
      "difficulty",
      "statement",
      "constraints (semicolon separated)",
      "example_input",
      "example_output",
      "allowed_languages (comma separated)",
      "visible_tests_json",
      "hidden_tests_json"
    ]);
    ws.addRow([
      "two-sum",
      "Two Sum",
      "easy",
      "Given an array nums and target, return indices of two numbers adding to target.",
      "2<=len(nums)<=1e4;-1e9<=nums[i]<=1e9",
      "nums=[2,7,11,15], target=9",
      "[0,1]",
      "javascript,python",
      '[{"id":"pub1","input":"[2,7]|9","expectedOutput":"[0,1]","visibility":"public"}]',
      '[{"id":"hid1","input":"[3,3]|6","expectedOutput":"[0,1]","visibility":"hidden"}]'
    ]);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=problem-template.xlsx");
    await wb.xlsx.write(res);
    res.end();
  })
);

problemsRouter.post(
  "/import",
  requireAuth,
  requireRole("admin"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "file required" });
    }
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    const imported = [];
    const upserts = [];
    const reservedIds = new Set();
    const rows = [];
    ws.eachRow((row, idx) => {
      if (idx === 1) return; // header
      rows.push({ row, idx });
    });
    for (const { row, idx } of rows) {
      const [
        rawId,
        title,
        difficulty,
        statement,
        constraintsRaw,
        exampleInput,
        exampleOutput,
        allowedRaw,
        visibleJson,
        hiddenJson
      ] = row.values.slice(1); // ExcelJS rows are 1-based with a dummy first element
      const titleText = String(title || "").trim();
      if (!titleText) continue;
      let id = String(rawId || "").trim();
      if (!id) {
        id = await generateUniqueId(titleText, reservedIds);
      } else if (reservedIds.has(id)) {
        throw new Error(`Duplicate id "${id}" in row ${idx}`);
      } else {
        reservedIds.add(id);
      }
      const constraints = (constraintsRaw || "").split(";").filter(Boolean);
      const allowedLanguages = String(allowedRaw || "")
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => SUPPORTED_LANGUAGES.includes(lang));
      const resolvedLanguages = allowedLanguages.length > 0 ? allowedLanguages : SUPPORTED_LANGUAGES;
      const examples = exampleInput
        ? [{ input: String(exampleInput), output: String(exampleOutput || "") }]
        : [];
      let visibleTests = [];
      let hiddenTests = [];
      try {
        visibleTests = visibleJson ? JSON.parse(visibleJson) : [];
        hiddenTests = hiddenJson ? JSON.parse(hiddenJson) : [];
      } catch (e) {
        throw new Error(`Invalid JSON in tests for row ${idx}`);
      }
      const problem = {
        id,
        title: titleText,
        difficulty: difficulty || "easy",
        statement,
        constraints,
        examples,
        visibleTests,
        hiddenTests,
        driverPreview: "",
        allowedLanguages: resolvedLanguages,
        published: false,
        deleted: false
      };
      upserts.push(problem);
      imported.push(problem.id);
    }
    for (const p of upserts) {
      await ProblemModel.updateOne({ id: p.id }, { $set: p }, { upsert: true });
    }
    return ok(res, { imported });
  })
);
