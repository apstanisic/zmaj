/* eslint-disable @typescript-eslint/no-namespace */
import { writeFile } from "fs/promises"
import { join } from "node:path"
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./e2e-consts.js"
import { e2eRoot } from "./e2e-env.js"
import { createSdk } from "./e2e-sdk.js"

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			ACCESS_TOKEN: string
		}
	}
}

export async function e2eInitAuthState(): Promise<void> {
	const sdk = createSdk("e2eSetup")

	const res = await sdk.auth
		.signIn({
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		})
		.catch((e) => {
			console.log({ e })
			throw new Error("qwerty")
		})

	if (res.status !== "signed-in") throw new Error("E2E user has problem with MFA")

	process.env.ACCESS_TOKEN = res.accessToken

	const data = {
		cookies: [],
		origins: [
			{
				origin: process.env.APP_URL,
				localStorage: [{ name: "ZMAJ_STORAGE_ADMIN_PANEL", value: res.accessToken }],
			},
		],
	}
	const location = join(e2eRoot, "src/state/storage-state.json")
	await writeFile(location, JSON.stringify(data, null, 4))
}
