import bcrypt from "bcryptjs";
import { UserModel } from "../auth/user.model.js";

const SEED_USERS = [
  { email: "admin@example.com", password: "adminpass", role: "admin" },
  { email: "demo@example.com", password: "password", role: "user" }
];

export async function seedUsers() {
  for (const entry of SEED_USERS) {
    const exists = await UserModel.findOne({ email: entry.email }).lean();
    if (exists) continue;
    const passwordHash = await bcrypt.hash(entry.password, 8);
    await UserModel.create({ email: entry.email, passwordHash, role: entry.role });
  }
}
