import mongoose from "mongoose";
import { env } from "./env.js";
import { seedProblems } from "../modules/problems/problems.seed.js";
import { seedUsers } from "../modules/users/users.seed.js";

export async function connectDatabase() {
  await mongoose.connect(env.mongoUrl);
  console.log(`[db] connected to ${env.mongoUrl}`);
  await seedProblems();
  await seedUsers();
}
