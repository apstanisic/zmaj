import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, CollectionDef, Struct } from "@zmaj-js/common"
import { AxiosInstance } from "axios"
import { SettingsClient } from "./settings.client"

export class SystemClient {
	readonly settings: SettingsClient
	constructor(private readonly client: AxiosInstance) {
		this.settings = new SettingsClient(client)
	}

	/**
	 * Get all OpenID Connect providers
	 * key is provider name, value is url
	 */
	async getOidcProviders(): Promise<Struct<{ url: string }>> {
		return this.client
			.get<Data<Struct<{ url: string }>>>("auth/oidc-providers")
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/** Get all infra collections */
	async getCollections(): Promise<CollectionDef[]> {
		return this.client
			.get<Data<CollectionDef[]>>("system/infra/collections")
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/** Checks if sign up is allowed */
	async isSignUpAllowed(): Promise<boolean> {
		return this.client
			.get<{ allowed: boolean }>("auth/sign-up/allowed")
			.then((res) => res.data.allowed)
			.catch(sdkThrow)
	}
}
