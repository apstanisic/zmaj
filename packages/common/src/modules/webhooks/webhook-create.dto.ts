import { ZodDto } from "@common/zod"
import { WebhookSchema } from "./webhook.schema"

export const WebhookCreateSchema = WebhookSchema.pick({
	url: true,
	name: true,
	description: true,
	enabled: true,
	sendData: true,
	httpHeaders: true,
	httpMethod: true,
	events: true,
})
export class WebhookCreateDto extends ZodDto(WebhookCreateSchema) {}
