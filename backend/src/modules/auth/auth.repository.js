import bcrypt from "bcryptjs";
import { UserModel } from "./user.model.js";

export const authRepository = {
  findByEmail: (email) => UserModel.findOne({ email }).lean(),
  createSession: (user, token) => ({ token, user: { id: user._id.toString(), email: user.email, role: user.role } }),
  createUser: async ({ email, password, role }) => {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    const count = await UserModel.estimatedDocumentCount();
    const resolvedRole = count === 0 ? "admin" : role || "user";
    const passwordHash = await bcrypt.hash(password, 8);
    const user = await UserModel.create({ email, passwordHash, role: resolvedRole });
    return user.toObject();
  },
  list: () => UserModel.find().lean()
};
