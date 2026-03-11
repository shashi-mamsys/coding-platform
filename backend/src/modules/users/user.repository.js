import { UserModel } from "../auth/user.model.js";

export const userRepository = {
  list: () => UserModel.find().select("email role").lean(),
  findById: (id) => UserModel.findById(id).select("email role").lean()
};
