import { SubmissionModel } from "./submission.model.js";

export const submissionsRepository = {
  save: async (submission) => {
    const created = await SubmissionModel.create(submission);
    return created.toObject();
  },
  update: async (id, patch) => {
    const next = await SubmissionModel.findOneAndUpdate({ id }, { $set: patch }, { new: true }).lean();
    return next || null;
  },
  get: async (id) => {
    return SubmissionModel.findOne({ id }).lean();
  },
  list: async (filter = {}) => {
    const query = {};
    if (filter.userId) query.userId = filter.userId;
    if (filter.problemId) query.problemId = filter.problemId;
    return SubmissionModel.find(query).sort({ createdAt: -1 }).lean();
  }
};
