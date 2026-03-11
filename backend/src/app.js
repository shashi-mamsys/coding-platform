import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { authRouter } from "./modules/auth/auth.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { problemsRouter } from "./modules/problems/problems.routes.js";
import { submissionsRouter } from "./modules/submissions/submissions.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/problems", problemsRouter);
  app.use("/api/submissions", submissionsRouter);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  app.use(errorMiddleware);
  return app;
}
