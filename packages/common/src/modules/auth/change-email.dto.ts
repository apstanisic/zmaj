import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { ZodPassword } from "../../zod/zod-utils"

export const ChangeEmailSchema = z.object({
	password: ZodPassword(),
	newEmail: z.string().email(),
})

export class ChangeEmailDto extends ZodDto(ChangeEmailSchema) {}
