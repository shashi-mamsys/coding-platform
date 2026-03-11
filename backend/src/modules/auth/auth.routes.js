import { Router } from "express";
import { login, me, signup } from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/signup", signup);
authRouter.get("/me", requireAuth, me);
