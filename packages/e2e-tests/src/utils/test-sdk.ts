import { ZmajSdk } from "@zmaj-js/client-sdk"
import { createBasicToken, qsStringify, Struct, throwErr } from "@zmaj-js/common"
import { writeFile } from "fs/promises"
// import { fileURLToPath } from "node:url"
// import { dirname } from "path"

// const dir = dirname(fileURLToPath(import.meta.url))

export const playwrightAuthorizationHeader = createBasicToken("admin@example.com", "password")

function buildSdk(): ZmajSdk {
	const sdk = new ZmajSdk({ url: "http://localhost:7100/api", name: "TEMP_TEST" })

	sdk.client.defaults.headers.common = {
		Authorization: playwrightAuthorizationHeader,
	}
	return sdk
}

export const testSdk = buildSdk()

export async function testSdkSignIn(): Promise<void> {
	const sdk = new ZmajSdk({ url: "http://localhost:7100/api", name: "TEMP1" })
	const res = await sdk.auth.signIn({
		email: "admin@example.com",
		password: "password",
	})
	if (res.status !== "signed-in") throwErr("123")
	const data = {
		cookies: [],
		origins: [
			{
				origin: "http://localhost:7100",
				localStorage: [{ name: "ZMAJ_STORAGE_ADMIN_PANEL", value: res.accessToken }],
			},
		],
	}
	await writeFile("src/state/storage-state.json", JSON.stringify(data, null, 4))
}

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
