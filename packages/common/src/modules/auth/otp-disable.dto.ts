import { ZodPassword } from "@common/zod"
import { z } from "zod"
import { ZodDto } from "../../zod/zod-dto"

export const OtpDisableSchema = z.object({
	password: ZodPassword(),
})

export class OtpDisableDto extends ZodDto(OtpDisableSchema) {}
