import { sdkThrow } from "@client-sdk/errors/error-utils"
import { SdkState } from "@client-sdk/sdk-state"
import { ADMIN_ROLE_ID, AllowedAction, Data, getEndpoints } from "@zmaj-js/common"
import { AxiosInstance } from "axios"

type AuthzClientParams = {
	http: AxiosInstance
	state: SdkState
}

const ep = getEndpoints((e) => e.authz)

export class AuthzClient {
	#http: AxiosInstance
	#state: SdkState

	constructor({ http, state }: AuthzClientParams) {
		this.#http = http
		this.#state = state
	}

	/**
	 *
	 * @returns `null` if user is admin, otherwise all allowed actions
	 */
	async allowedActions(): Promise<AllowedAction[] | null> {
		if (this.#state.currentUser?.roleId === ADMIN_ROLE_ID) return null

		return this.#http
			.get<Data<AllowedAction[] | null>>(ep.getPermissions)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}
}
