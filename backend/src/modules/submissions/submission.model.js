import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    testId: String,
    visibility: { type: String, enum: ["public", "hidden"], default: "public" },
    status: String,
    message: String,
    runtimeMs: Number
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    userId: String,
    problemId: String,
    language: String,
    code: String,
    mode: { type: String, enum: ["run", "submit"], default: "run" },
    status: { type: String, default: "queued" },
    results: [resultSchema],
    stdout: String,
    stderr: String,
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const SubmissionModel = mongoose.model("Submission", submissionSchema);
