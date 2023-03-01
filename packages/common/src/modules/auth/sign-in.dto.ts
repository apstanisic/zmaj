import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"
import { SignUpSchema } from "./sign-up.dto"

export const SignInSchema = SignUpSchema.pick({
	email: true,
	password: true,
}).extend({ otpToken: z.string().nullish() })

export class SignInDto extends ZodDto(SignInSchema) {}
