import { z } from "zod"

/**
 * This should be used to specify specific config for S3, local...
 */
export const GenericStorageConfigSchema = z.object({
	type: z.string().min(1).max(40),
	name: z.string().min(1).max(100),
	uploadDisabled: z.boolean().default(false),
	basePath: z.string().optional(),
})

export type GenericStorageParams = z.infer<typeof GenericStorageConfigSchema>

/**
 * This should be used when user passes unknown types, since this keeps unknown keys
 */
export const BaseStorageConfigSchema = GenericStorageConfigSchema.catchall(z.unknown())
