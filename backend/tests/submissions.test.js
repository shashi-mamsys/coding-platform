import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("submissions flow (mock executor)", () => {
  it("lists problems", async () => {
    const res = await request(app).get("/api/problems").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("creates a submission and reaches a terminal state", async () => {
    const createRes = await request(app)
      .post("/api/submissions")
      .send({ problemId: "two-sum", language: "javascript", code: "export const solve=()=>[];" })
      .expect(201);

    expect(createRes.body.status).toBe("queued");
    const id = createRes.body.id;

    // poll until status not queued/running or timeout
    let attempts = 0;
    let status = createRes.body.status;
    let finalRes = createRes;
    while (["queued", "running"].includes(status) && attempts < 10) {
      await new Promise((r) => setTimeout(r, 200));
      finalRes = await request(app).get(`/api/submissions/${id}`).expect(200);
      status = finalRes.body.status;
      attempts += 1;
    }

    expect(["passed", "failed"]).toContain(status);
    expect(finalRes.body.results?.length).toBeGreaterThanOrEqual(1);
  });
});
