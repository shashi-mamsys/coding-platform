import { Router } from "express";
import { asyncHandler, ok } from "../../utils/helpers.js";
import { submissionsService } from "./submissions.service.js";
import { submissionSchema } from "./submissions.validation.js";
import { optionalAuth } from "../../middleware/optionalAuth.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const submissionsRouter = Router();

submissionsRouter.post(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const payload = submissionSchema.parse(req.body);
    const submission = await submissionsService.create(payload, req.user || null);
    return ok(res, submission, 201);
  })
);

submissionsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const problemId = req.query.problemId ? String(req.query.problemId) : undefined;
    const list = await submissionsService.listByUser(req.user.id, problemId);
    return ok(res, list);
  })
);

submissionsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const record = await submissionsService.get(req.params.id);
    if (!record) return res.status(404).json({ error: "Submission not found" });
    if (req.user.role !== "admin") {
      if (!record.userId || record.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    return ok(res, record);
  })
);
