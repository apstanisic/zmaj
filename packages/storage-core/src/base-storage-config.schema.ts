import { z } from "zod"

export type BaseStorageParams = z.infer<typeof BaseStorageConfigSchema>

export const BaseStorageConfigSchema = z
	.object({
		type: z.string().min(1).max(40),
		name: z.string().min(1).max(60),
		uploadDisabled: z.boolean().default(false),
		basePath: z.string().optional(),
	})
	.passthrough()

// export class BaseStorageConfig extends ZodDto(BaseStorageConfigSchema) {}
