import { z } from "zod"

export const AuthUserSchema = z.object({
	userId: z.string().uuid(),
	roleId: z.string().uuid(),
	email: z.string().email(),
	exp: z.number().int().optional(),
	iat: z.number().int().optional(),
	sub: z.string().optional(),
})
