import { z } from "zod"

export const PasswordSchema = z.string().trim().min(8).max(50)
