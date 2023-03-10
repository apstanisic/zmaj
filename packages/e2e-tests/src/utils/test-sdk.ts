import { ZmajSdk } from "@zmaj-js/client-sdk"
import { createBasicToken, qsStringify, Struct, throwErr } from "@zmaj-js/common"

export const playwrightAuthorizationHeader = createBasicToken("admin@example.com", "password")

function buildSdk(): ZmajSdk {
	const sdk = new ZmajSdk({ url: "http://localhost:7100/api" })
	sdk.client.defaults.headers.common = {
		Authorization: playwrightAuthorizationHeader,
	}
	return sdk
}

export const testSdk = buildSdk()

type RaQuery = {
	filter?: Struct
	order?: "ASC" | "DESC"
	page?: number
	perPage?: number
	sort?: string
}
export function toRaQuery(query: RaQuery): string {
	const filter = query.filter ? JSON.stringify(query.filter) : {}
	return qsStringify({ ...query, filter })
}

export function getIdFromShow(url: string): string {
	if (!url.includes("/show")) throwErr("478293")
	return url.replaceAll("/show", "").split("/").at(-1)!
}
