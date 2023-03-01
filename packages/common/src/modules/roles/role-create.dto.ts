import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"

export const RoleCreateSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().nullish(),
})

export class RoleCreateDto extends ZodDto(RoleCreateSchema) {}
