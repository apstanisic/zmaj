import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, Role } from "@zmaj-js/common"
import { AxiosInstance } from "axios"

export class AuthSettingsClient {
	constructor(private http: AxiosInstance) {}

	async setSignUpAllowed(allowed: boolean): Promise<boolean> {
		return this.http
			.put<{ allowed: boolean }>("auth/sign-up/allowed", { allowed })
			.then((r) => r.data.allowed)
			.catch(sdkThrow)
	}

	async setDefaultRole(roleId: string): Promise<Role> {
		return this.http
			.put<Data<Role>>("auth/config/default-role", { roleId })
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}
}
