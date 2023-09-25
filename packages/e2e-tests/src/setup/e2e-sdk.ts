import { ZmajSdk } from "@zmaj-js/client-sdk"
import { v4 } from "uuid"

export function createSdk(name = v4(), requireToken = true): ZmajSdk {
	const accessToken = process.env.ACCESS_TOKEN
	if (!accessToken && requireToken) throw new Error("Missing access token")
	return new ZmajSdk({ url: `${process.env.APP_URL}/api`, name, accessToken })
}
