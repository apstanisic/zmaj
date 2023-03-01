import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, getEndpoints, IdRecord, PublicAuthSession } from "@zmaj-js/common"
import { AxiosInstance } from "axios"

const ep = getEndpoints((e) => e.auth.authSessions)

export class AuthSessionsClient {
	constructor(private readonly http: AxiosInstance) {}

	async getActive(): Promise<IdRecord<PublicAuthSession>[]> {
		return this.http
			.get<Data<IdRecord<PublicAuthSession>[]>>(ep.userSessions)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	async deleteById({ id }: { id: string }): Promise<IdRecord<PublicAuthSession>> {
		return this.http
			.delete<Data<IdRecord<PublicAuthSession>>>(ep.userSessionDeleteById.replace(":id", id))
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	async isCurrentSession(sessionId: string): Promise<boolean> {
		return this.http
			.get<Data<IdRecord<PublicAuthSession>>>(ep.userCurrentSession)
			.then((r) => r.data.data.id === sessionId)
			.catch(sdkThrow)
	}
}
