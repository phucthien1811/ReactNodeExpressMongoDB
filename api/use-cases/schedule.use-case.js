import scheduleRepo from "../repositories/schedule.repo.js";

export const scheduleService = {
  list: (filters) => scheduleRepo.findAll(filters),
  count: (filters) => scheduleRepo.findAll(filters).then(data => data.length),
  byId: (id) => scheduleRepo.findById(id),
  create: (data) => scheduleRepo.create(data),
  update: (id, data) => scheduleRepo.update(id, data),
  remove: (id) => scheduleRepo.delete(id),
};
