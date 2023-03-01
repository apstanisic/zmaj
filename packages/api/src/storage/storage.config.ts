import { ConfigService } from "@api/config/config.service"
import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { BaseStorageConfigSchema, StorageAdapter } from "@zmaj-js/storage-core"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./storage.module-definition"

const StorageConfigSchema = z.object({
	/**
	 * Providers where images are stored
	 */
	providers: z.array(BaseStorageConfigSchema.catchall(z.unknown())).default([]),
	/**
	 * Additional adapters. Currently there is local filesystem and s3 adapters installed by default
	 */
	adapters: z.array(z.custom<StorageAdapter>()).default([]),
	/**
	 * Should we provide default file storage on local filesystem if there are no providers
	 */
	enableFallbackStorage: z.boolean().default(false),
})

export type StorageConfigParams = z.input<typeof StorageConfigSchema>

@Injectable()
export class StorageConfig extends ZodDto(StorageConfigSchema) {
	constructor(@Inject(MODULE_OPTIONS_TOKEN) params: StorageConfigParams, config: ConfigService) {
		const rawProviders = config.getGroups("STORAGE_PROVIDERS")
		const fromEnvFile: any[] = []

		for (const [name, providerConfig] of Object.entries(rawProviders)) {
			// we will fallback on name specified in "STORAGE_PROVIDERS" if user didn't provide
			fromEnvFile.push({ name, ...providerConfig })
		}

		super({
			...params, //
			providers: [...(params.providers ?? []), ...fromEnvFile],
		})
	}
}
