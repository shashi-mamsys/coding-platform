import { randomUUID } from "node:crypto";
import { submissionsRepository } from "./submissions.repository.js";
import { enqueueSubmission } from "../../queues/submission.queue.js";
import { selectExecutorForLanguage } from "../../executor/index.js";
import { ProblemModel } from "../problems/problem.model.js";

const MOCK_DURATION_MS = 800;

export const submissionsService = {
  create: async ({ problemId, language, code, mode }, user = null) => {
    const problem = await ProblemModel.findOne({ id: problemId }).lean();
    if (!problem) {
      const err = new Error("Problem not found");
      err.status = 404;
      throw err;
    }
    if (problem.deleted) {
      const err = new Error("Problem not found");
      err.status = 404;
      throw err;
    }
    if (!problem.published && user?.role !== "admin") {
      const err = new Error("Problem not found");
      err.status = 404;
      throw err;
    }
    if (problem.allowedLanguages && problem.allowedLanguages.length > 0) {
      if (!problem.allowedLanguages.includes(language)) {
        const err = new Error("Language not allowed for this problem");
        err.status = 400;
        throw err;
      }
    }
    const now = new Date().toISOString();
    const submission = {
      id: randomUUID(),
      userId: user?.id || null,
      problemId,
      language,
      code,
      mode,
      status: "queued",
      createdAt: now,
      updatedAt: now
    };
    const tests =
      mode === "run"
        ? [...(problem.visibleTests || [])]
        : [...(problem.visibleTests || []), ...(problem.hiddenTests || [])];
    const executor = selectExecutorForLanguage(language);

    if (mode === "run") {
      try {
        const execResult = await executor({ language, code, tests });
        const results = execResult.results || [];
        const passedCount = results.filter((r) => r.status === "passed").length;
        const totalCount = results.length;
        const overall = results.some((r) => r.status !== "passed") ? "failed" : "passed";
        return {
          id: null,
          status: overall,
          results,
          stdout: execResult.stdout || "",
          stderr: execResult.stderr || "",
          passedCount,
          totalCount,
          mode: "run"
        };
      } catch (err) {
        return {
          id: null,
          status: "failed",
          results: [],
          stdout: "",
          stderr: String(err),
          passedCount: 0,
          totalCount: tests.length,
          mode: "run"
        };
      }
    }

    await submissionsRepository.save(submission);

    enqueueSubmission(submission, {
      durationMs: MOCK_DURATION_MS,
      onStart: async () => {
        await submissionsRepository.update(submission.id, { status: "running" });
      },
      onComplete: async () => {
        try {
          const execResult = await executor({ language, code, tests });
          const results = execResult.results || [];
          const passedCount = results.filter((r) => r.status === "passed").length;
          const totalCount = results.length;
          const overall = results.some((r) => r.status !== "passed") ? "failed" : "passed";
          await submissionsRepository.update(submission.id, {
            status: overall,
            results,
            stdout: execResult.stdout,
            stderr: execResult.stderr,
            passedCount,
            totalCount
          });
        } catch (err) {
          await submissionsRepository.update(submission.id, {
            status: "failed",
            stderr: String(err),
            passedCount: 0
          });
        }
      }
    });
    return submission;
  },
  get: (id) => submissionsRepository.get(id),
  listByUser: (userId, problemId) => submissionsRepository.list({ userId, problemId })
};
