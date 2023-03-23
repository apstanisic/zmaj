import { ZmajSdk } from "@zmaj-js/client-sdk"
import { createBasicToken, qsStringify, Struct, throwErr } from "@zmaj-js/common"
import { readFileSync } from "fs"
import { writeFile } from "fs/promises"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import path from "path"
// import { fileURLToPath } from "node:url"
// import { dirname } from "path"

const dir = dirname(fileURLToPath(import.meta.url))

export const playwrightAuthorizationHeader = createBasicToken("admin@example.com", "password")

export function getSdk(): ZmajSdk {
	const joined = path.join(dir, "../state/storage-state.json")
	let accessToken: string | undefined
	try {
		// I know this is not ideal, but it's testing, so I do not care that it reads sync
		// It's only read once, I can simply write `const sdk = getSdk(); sdk.one; sdk.two`
		// This uses same token as app, so I do not have to sign in twice, and basic auth
		// is kinda hacky to use with sdk (must set auth token in axios manually)
		const file = readFileSync(joined, "utf-8")
		const data = JSON.parse(file)
		accessToken = data.origins[0].localStorage.find(
			(item: any) => item.name === "ZMAJ_STORAGE_ADMIN_PANEL",
		).value
	} catch (error) {
		console.log("Auth file does not exist")
		accessToken = undefined
	}
	return new ZmajSdk({ url: "http://localhost:7100/api", name: "TEST_JWT_AUTH", accessToken })
}

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
