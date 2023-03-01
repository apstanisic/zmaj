import { ZodDto } from "@common/zod"
import { z } from "zod"

const schema = z
	.object({
		description: z.string().max(1000).nullable(),
		folderPath: z.string().min(1).max(200),
		name: z.string().min(1).max(200),
	})
	.partial()

export class FileUpdateDto extends ZodDto(schema) {}
