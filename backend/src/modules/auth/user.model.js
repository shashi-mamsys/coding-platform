import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    role: { type: String, enum: ["admin", "user"], default: "user" }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
