import { authService } from "./auth.service.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { asyncHandler, ok } from "../../utils/helpers.js";

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const session = await authService.login(payload);
  return ok(res, session);
});

export const signup = asyncHandler(async (req, res) => {
  const payload = signupSchema.parse(req.body);
  const session = await authService.signup(payload);
  return ok(res, session, 201);
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, authService.me(req.user));
});
