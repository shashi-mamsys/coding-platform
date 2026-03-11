import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    id: String,
    input: String,
    expectedOutput: String,
    visibility: { type: String, enum: ["public", "hidden"], default: "public" }
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    input: String,
    output: String,
    explanation: String
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    title: String,
    statement: String,
    difficulty: { type: String, default: "easy" },
    constraints: [String],
    examples: [exampleSchema],
    visibleTests: [testSchema],
    hiddenTests: [testSchema],
    driverPreview: String,
    allowedLanguages: [String],
    published: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ProblemModel = mongoose.model("Problem", problemSchema);
