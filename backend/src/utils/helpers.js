export const ok = (res, payload = {}, status = 200) => res.status(status).json(payload);

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
