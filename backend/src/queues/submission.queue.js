import { handleSubmission } from "../jobs/codeExecution.worker.js";

const queue = [];
let active = 0;
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);

export function enqueueSubmission(submission, { durationMs = 500, onStart, onComplete } = {}) {
  queue.push({ submission, durationMs, onStart, onComplete });
  drain();
}

function drain() {
  if (active >= concurrency) return;
  const job = queue.shift();
  if (!job) return;
  active += 1;
  setTimeout(async () => {
    try {
      await job.onStart?.();
      const result = await handleSubmission(job.submission, job.durationMs);
      await job.onComplete?.(result);
    } finally {
      active -= 1;
      drain();
    }
  }, 0);
}
