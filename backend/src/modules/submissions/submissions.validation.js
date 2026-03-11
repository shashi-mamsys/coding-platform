import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "../../constants/languages.js";

export const submissionSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(SUPPORTED_LANGUAGES),
  code: z.string().min(1),
  mode: z.enum(["run", "submit"]).default("run")
});
