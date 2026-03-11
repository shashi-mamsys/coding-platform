import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";

export const authService = {
  login: async ({ email, password }) => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: "1h" });
    return authRepository.createSession(user, token);
  },
  verify: (token) => jwt.verify(token, env.jwtSecret),
  me: (user) => ({ id: user.id, email: user.email, role: user.role }),
  signup: async ({ email, password }) => {
    const user = await authRepository.createUser({ email, password });
    const subject = user.id || user._id?.toString();
    const token = jwt.sign({ sub: subject, role: user.role }, env.jwtSecret, { expiresIn: "1h" });
    return authRepository.createSession(user, token);
  }
};
