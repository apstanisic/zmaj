import { ZodDto } from "@zmaj-js/common"
import { GenericStorageConfigSchema } from "@zmaj-js/storage-core"
import { z } from "zod"

// export type S3StorageConfig = z.infer<typeof s3StorageConfigSchema>

export const s3StorageConfigSchema = GenericStorageConfigSchema.extend({
	type: z.literal("s3").default("s3"),
	accessKey: z.string().min(1).max(100),
	bucket: z.string().min(1).max(100),
	endpoint: z.string().min(1).max(1000),
	region: z.string().min(1).max(50),
	secretKey: z.string().min(1).max(200),
	createMissingBucket: z.boolean().default(false),
})

export class S3StorageConfig extends ZodDto(s3StorageConfigSchema) {}
