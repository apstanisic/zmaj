import { sdkThrow } from "@client-sdk/errors/error-utils"
import {
	DisplayEnableMfaPageParams,
	getEndpoints,
	OtpDisableDto,
	OtpEnableDto,
	SignInDto,
} from "@zmaj-js/common"
import { AxiosInstance } from "axios"

const ep = getEndpoints((e) => e.auth.mfa)

export class MfaClient {
	constructor(private http: AxiosInstance) {}

	/** Request to enable one-time-password (2fa) */
	async requestToEnableOtp(): Promise<DisplayEnableMfaPageParams> {
		return this.http
			.get<DisplayEnableMfaPageParams>(ep.requestToEnableOtp)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async confirmOtp(data: OtpEnableDto): Promise<void> {
		await this.http
			.put(ep.enableOtp, data)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async disableOtp(data: OtpDisableDto): Promise<void> {
		await this.http
			.put(ep.disableOtp, data)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async hasMfa(data?: SignInDto): Promise<{ enabled: boolean; required: boolean }> {
		return this.http
			.post<{ enabled: boolean; required: boolean }>(ep.hasMfa, data ?? {})
			.then((r) => r.data)
			.catch(sdkThrow)
	}
}
