// Placeholder worker; wire to actual sandboxed executor later.
export async function handleSubmission(submission, durationMs = 500) {
  console.log("[worker] executing submission", submission.id);
  await new Promise((r) => setTimeout(r, durationMs));
  // Mock result: all public tests pass, hidden status undisclosed
  return {
    ...submission,
    status: "passed",
    results: [
      { testId: "public-1", visibility: "public", status: "passed", runtimeMs: 12 },
      { testId: "hidden-1", visibility: "hidden", status: "passed" }
    ]
  };
}
