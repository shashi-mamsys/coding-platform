import { authService } from "../modules/auth/auth.service.js";

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();
  const [, token] = header.split(" ");
  if (!token) return next();
  try {
    const payload = authService.verify(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next();
  }
}
