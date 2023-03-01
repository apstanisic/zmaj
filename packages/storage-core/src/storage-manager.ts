import { Struct } from "@zmaj-js/common"
import { LocalFileStorage } from "./adapter-local/storage-local"
import { BaseStorage } from "./base-storage"
import { ProviderConfig } from "./provider-config.type"
import { InvalidProviderError, StorageProviderNotFound } from "./storage-errors"

export type StorageAdapter = {
	new (config: any): BaseStorage
	fromStruct(params: ProviderConfig): BaseStorage
	type: string
}

export class FileStorageManager {
	/** All types of adapter */
	private adapters: StorageAdapter[] = []

	/**
	 * All registered providers
	 */
	private providers: Record<string, BaseStorage> = {}

	/** Default provider name */
	private defaultProvider: string

	/**
	 *
	 * @param params.providers Providers available
	 * @param params.adapters Adapters available (local adapter is already added)
	 * @param params.defaultProvider provider that should be user when name is not provided
	 */
	constructor(params?: {
		adapters?: StorageAdapter[]
		providers: Struct<ProviderConfig | BaseStorage>
		defaultProvider?: string
	}) {
		this.addAdapter(LocalFileStorage)

		this.defaultProvider =
			params?.defaultProvider ??
			Object.keys(params?.providers ?? []).at(0) ?? //
			"default"

		for (const adapter of params?.adapters ?? []) {
			this.addAdapter(adapter)
		}

		for (const [name, provider] of Object.entries(params?.providers ?? {})) {
			this.addProvider(name, provider)
		}
	}

	addAdapter(adapter: StorageAdapter): void {
		this.adapters.push(adapter)
	}

	addProvider(name: string, provider: ProviderConfig | BaseStorage): void {
		const providerName = name

		if (provider instanceof BaseStorage) {
			this.providers[name] = provider
			return
		}

		const Adapter = this.adapters.find((a) => a.type === provider.type)

		if (!Adapter) {
			throw new InvalidProviderError(`Adapter does not exists: ${provider.type}`)
		}

		this.providers[providerName] = Adapter.fromStruct(provider)
	}

	provider(name: string = "default"): BaseStorage {
		const storage = name === "default" ? this.providers[this.defaultProvider] : this.providers[name]
		if (!storage) throw new StorageProviderNotFound("#0182309")
		return storage
	}

	get enabledProviders(): string[] {
		return Object.entries(this.providers)
			.filter(([, v]) => v.uploadDisabled !== true)
			.map(([k]) => k)
	}

	/**
	 * Destroy all providers. Should be only be called on app shutdown
	 */
	async destroy(): Promise<void> {
		for (const provider of Object.values(this.providers)) {
			await provider.destroy()
		}
	}

	/**
	 * Initializes all providers
	 */
	async init(): Promise<void> {
		for (const provider of Object.values(this.providers)) {
			await provider.init()
		}
	}

	/**
	 * Get default storage
	 * Gets storage with name default, or first provided storage
	 */
	// private get defaultStorage(): BaseStorage {
	//   let defaultProvider = this.providers["default"]
	//   if (!defaultProvider) {
	//     const firstProvider = Object.keys(this.providers)[0]
	//     defaultProvider = this.providers[firstProvider ?? "_"]
	//     if (!defaultProvider) throw new StorageProviderNotFound("#38123")
	//   }
	//   return defaultProvider
	// }
}
