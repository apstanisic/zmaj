import { parseJsonWithDates, Struct } from "@zmaj-js/common"
import Axios, { AxiosInstance } from "axios"
import EventEmitter from "eventemitter3"
import { isString } from "radash"
import { AuthClient, AuthEventFn } from "./auth/auth.client"
import { AuthzClient } from "./auth/authz.client"
import { ActivityLogClient } from "./clients/activity-log.client"
import { CrudClient } from "./clients/crud.client"
import { FilesClient } from "./clients/files.client"
import { InfraClient } from "./clients/infra.client"
import { PermissionsClient } from "./clients/permissions.client"
import { RolesClient } from "./clients/roles.client"
import { SystemClient } from "./clients/system.client"
import { UsersClient } from "./clients/users.client"
import { WebhooksClient } from "./clients/webhooks.client"
import { SdkState } from "./sdk-state"

export class ZmajSdk {
	/** HTTP Client */
	readonly client: AxiosInstance

	/** Auth */
	readonly auth: AuthClient

	/** Files */
	readonly files: FilesClient

	/** Users */
	readonly users: UsersClient

	/** Roles */
	readonly roles: RolesClient

	/** Permissions */
	readonly permissions: PermissionsClient

	/** Activity Log */
	readonly activityLog: ActivityLogClient

	/** Webhooks */
	readonly webhooks: WebhooksClient

	/** System */
	readonly system: SystemClient

	/** Infra */
	readonly infra: InfraClient

	/** API URL */
	readonly apiUrl: string

	/** State */
	readonly state: SdkState

	readonly authz: AuthzClient

	readonly #emitter = new EventEmitter<{ auth: AuthEventFn }>()

	constructor({ url, ...options }: SdkParams) {
		// const _url = new URL(url)
		// const joined = _url.origin + (_url.pathname === "/" ? "/api" : _url.pathname)
		this.apiUrl = url
		// this.apiUrl = url
		this.client = this.#createClient()
		this.state = new SdkState({
			sdkName: options.name,
			accessToken: options.accessToken,
			emitter: this.#emitter,
		})

		this.auth = new AuthClient({ http: this.client, state: this.state, emitter: this.#emitter })
		this.authz = new AuthzClient({ http: this.client, state: this.state })
		this.files = new FilesClient(this.client)
		this.system = new SystemClient(this.client)
		this.roles = new RolesClient(this.client)
		this.permissions = new PermissionsClient(this.client)
		this.activityLog = new ActivityLogClient(this.client)
		this.infra = new InfraClient(this.client)
		this.users = new UsersClient(this.client)
		this.webhooks = new WebhooksClient(this.client)
	}

	/** Create Axios instance */
	#createClient(): AxiosInstance {
		return Axios.create({
			baseURL: this.apiUrl,
			withCredentials: true,
			// This enables us to automatically convert serialized dates to `Date` object
			transformResponse: (resData) => (isString(resData) ? parseJsonWithDates(resData) : resData),
		})
	}

	/**
	 * Get CRUD API for provided collection
	 * @param name collections name
	 */
	collection<T extends Struct = Struct>(name: string): CrudClient<T> {
		return new CrudClient<T>(this.client, name)
	}
}

type SdkParams = {
	/**
	 * URL to API
	 */
	url: string
	/**
	 * Name of SDK. User can have multiple different APIs connected
	 * Name is used for differentiating storage
	 */
	name?: string
	/**
	 * Access token
	 * In case of SSR user can send and receive access token to be used
	 */
	accessToken?: string
}
