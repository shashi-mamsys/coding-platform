import { ERROR_CODES } from "../constants/errors.js";
import { authService } from "../modules/auth/auth.service.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Auth required", code: ERROR_CODES.UNAUTHORIZED });
  }
  const [, token] = header.split(" ");
  try {
    const payload = authService.verify(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token", code: ERROR_CODES.UNAUTHORIZED });
  }
}
