import { ERROR_CODES } from "../constants/errors.js";
import { logger } from "../utils/logger.js";
import { ZodError } from "zod";

export function errorMiddleware(err, _req, res, _next) {
  logger.error(err);
  const isValidation = err instanceof ZodError;
  const status = err.status || (isValidation ? 400 : 500);
  res.status(status).json({
    error: err.message || (isValidation ? "Validation failed" : "Internal server error"),
    code: err.code || (isValidation ? ERROR_CODES.VALIDATION_ERROR : ERROR_CODES.INTERNAL)
  });
}
