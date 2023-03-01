import { ZodDto } from "@common/zod"
import { WebhookCreateSchema } from "./webhook-create.dto"

const WebhookUpdateSchema = WebhookCreateSchema.partial()

export class WebhookUpdateDto extends ZodDto(WebhookUpdateSchema) {}
