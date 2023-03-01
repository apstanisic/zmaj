import { sdkThrow } from "@client-sdk/errors/error-utils"
import {
	ChangeEmailDto,
	Data,
	getEndpoints,
	ProfileInfo,
	UserUpdateDto,
	UserUpdatePasswordDto,
} from "@zmaj-js/common"
import { AxiosInstance } from "axios"

const emailEp = getEndpoints((e) => e.auth.account.emailChange)
const profileEp = getEndpoints((e) => e.auth.account.profile)

export class ProfileClient {
	constructor(private http: AxiosInstance) {}

	/** Get user profile */
	async getUserInfo(): Promise<ProfileInfo> {
		return this.http
			.get<Data<ProfileInfo>>(profileEp.get)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/** Update user info */
	async changeUserInfo(data: UserUpdateDto): Promise<ProfileInfo> {
		return this.http
			.put<Data<ProfileInfo>>(profileEp.update, data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/** Change email */
	async requestEmailChange(data: ChangeEmailDto): Promise<string> {
		return this.http
			.put<{ newEmail: string; currentEmail: string }>(emailEp.request, data)
			.then((r) => r.data.newEmail)
			.catch(sdkThrow)
	}

	/** Change password */
	async changePassword(passwords: UserUpdatePasswordDto): Promise<string> {
		return this.http
			.put<{ email: string }>(profileEp.updatePassword, passwords)
			.then((r) => r.data.email)
			.catch(sdkThrow)
	}
}
