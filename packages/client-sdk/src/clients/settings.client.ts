import { sdkThrow } from "@client-sdk/errors/error-utils"
import { ChangeSettingsDto, getEndpoints, Settings } from "@zmaj-js/common"
import { AxiosInstance } from "axios"

const ep = getEndpoints((ep) => ep.dynamicSettings)

export class SettingsClient {
	constructor(private http: AxiosInstance) {}

	async getSettings(): Promise<Settings> {
		return this.http
			.get<Settings>(ep.getSettings)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async changeSettings(data: ChangeSettingsDto): Promise<Settings> {
		return this.http
			.put<Settings>(ep.setSettings, data, {})
			.then((r) => r.data)
			.catch(sdkThrow)
	}
}
