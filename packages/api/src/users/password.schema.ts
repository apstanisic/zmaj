import { z } from "zod"

/** Valid password schema */
export const PasswordSchema = z.string().trim().min(8).max(50)
