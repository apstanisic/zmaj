import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { ZodPassword } from "../../zod/zod-utils"

export const UserUpdatePasswordSchema = z.object({
	oldPassword: ZodPassword(),
	newPassword: ZodPassword(),
})

export class UserUpdatePasswordDto extends ZodDto(UserUpdatePasswordSchema) {}
