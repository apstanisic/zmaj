import { z } from "zod"
import { ADMIN_ROLE_ID, PUBLIC_ROLE_ID } from "../roles"

const notAdmin = (roleId: string): boolean => roleId !== ADMIN_ROLE_ID

export const RuntimeSettingsSchema = z.object({
	signUpAllowed: z.boolean().catch(false),
	defaultSignUpRole: z.string().uuid().refine(notAdmin).catch(PUBLIC_ROLE_ID),
})
