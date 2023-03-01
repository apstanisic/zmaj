import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { ZodPassword } from "../../zod/zod-utils"

function zodTransformEmpty(v: string | undefined | null): string | null | undefined {
	return v === "" ? null : v
}

export const SignUpSchema = z.object({
	email: z.string().email(),
	password: ZodPassword(),
	firstName: z.string().max(50).nullish().transform(zodTransformEmpty).default(null),
	lastName: z.string().max(50).nullish().transform(zodTransformEmpty).default(null),
})

export class SignUpDto extends ZodDto(SignUpSchema) {}
