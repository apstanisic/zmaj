import { throw500 } from "@api/common/throw-http"
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { Struct } from "@zmaj-js/common"
import { BaseStorage, FileStorageManager, ProviderConfig } from "@zmaj-js/storage-core"
import { S3Storage } from "@zmaj-js/storage-s3"
import { StorageConfig } from "./storage.config"

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
	private storageManager: FileStorageManager

	/**
	 * Get list of enabled providers
	 */
	get enabledProviders(): string[] {
		return this.storageManager.enabledProviders
	}

	constructor(private readonly config: StorageConfig) {
		this.storageManager = this.initializeProviders()
	}

	/**
	 * Get provider
	 *
	 * @param name Provider name. If no name is provided it will default to 'default' provider
	 * @returns Provider with requested `name`, default storage if `undefined`
	 * @throws If provider does not exist
	 */
	provider(name?: string): BaseStorage {
		try {
			// it throws if not found
			return this.storageManager.provider(name)
		} catch (error) {
			throw500(1582)
		}
	}

	private initializeProviders(): FileStorageManager {
		//
		const providers: Struct<ProviderConfig> = {}

		for (const provider of this.config.providers) {
			providers[provider.name] = provider
		}

		// Fallback to local storage if no providers found
		if (Object.keys(providers).length === 0 && this.config.enableFallbackStorage) {
			providers["default"] = {
				basePath: "files",
				uploadDisabled: false,
				name: "default",
				type: "local",
			}
		}

		return new FileStorageManager({
			adapters: [S3Storage, ...this.config.adapters],
			providers: providers,
			defaultProvider: this.config.providers.at(0)?.name,
		})
	}

	async onModuleDestroy(): Promise<void> {
		await this.storageManager.destroy()
	}

	async onModuleInit(): Promise<void> {
		await this.storageManager.init()
	}
}
