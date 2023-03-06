import { GenericStorageConfigSchema } from "@storage-core/base-storage-config.schema"
import { ZodDto } from "@zmaj-js/common"
import path from "node:path"
import { z } from "zod"
export const LocalStorageConfigSchema = GenericStorageConfigSchema.extend({
	type: z.literal("local").default("local"),
	/**
	 * Make sure that it's always absolute path. Even though node will also use process.cwd,
	 * it's better to explicitly set
	 * @see https://nodejs.org/api/fs.html#string-paths
	 */
	basePath: z
		.string()
		.min(1)
		.max(1000)
		.transform((basePath) =>
			basePath.startsWith("/") ? basePath : path.join(process.cwd(), basePath),
		),
})

export class LocalStorageConfig extends ZodDto(LocalStorageConfigSchema) {}
