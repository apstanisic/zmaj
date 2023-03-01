import { intRegex } from "@common/regexes"
import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"

export const EnableOtpSchema = z.object({
	jwt: z.string(),
	code: z.string().length(6).regex(intRegex),
})

export class OtpEnableDto extends ZodDto(EnableOtpSchema) {}
