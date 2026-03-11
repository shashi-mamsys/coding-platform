import { Router } from "express";
import { getUser, listUsers } from "./user.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";

export const userRouter = Router();

userRouter.use(requireAuth, requireRole("admin"));
userRouter.get("/", listUsers);
userRouter.get("/:id", getUser);
