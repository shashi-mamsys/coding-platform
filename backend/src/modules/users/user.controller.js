import { asyncHandler, ok } from "../../utils/helpers.js";
import { userService } from "./user.service.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await userService.list();
  return ok(res, users);
});
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return ok(res, user);
});
