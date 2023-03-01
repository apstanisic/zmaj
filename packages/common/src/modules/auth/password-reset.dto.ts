import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"

export const PasswordResetSchema = z.object({
	password: z.string().trim().min(8).max(50),
	token: z.string().trim().min(20).max(300),
	email: z.string().email(),
})

export class PasswordResetDto extends ZodDto(PasswordResetSchema) {}
