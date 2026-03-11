import { userRepository } from "./user.repository.js";

export const userService = {
  list: () => userRepository.list(),
  get: (id) => userRepository.findById(id)
};
