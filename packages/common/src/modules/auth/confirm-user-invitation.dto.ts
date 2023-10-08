import { ZodDto } from "@common/zod"
import { z } from "zod"
import { SignUpSchema } from "./sign-up.dto"

const Schema = SignUpSchema.extend({
	token: z.string().min(10).max(2000),
})

export class ConfirmUserInvitationDto extends ZodDto(Schema) {}
