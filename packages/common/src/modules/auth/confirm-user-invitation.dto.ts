import { ZodDto } from "@common/zod"
import { z } from "zod"
import { SignUpSchema } from "./sign-up.dto"

const Schema = SignUpSchema.extend({
	token: z.string().uuid(),
})

export class ConfirmUserInvitationDto extends ZodDto(Schema) {}
