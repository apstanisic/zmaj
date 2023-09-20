import { ZmajSdk } from "@zmaj-js/client-sdk"
import { createSdk } from "../setup/e2e-sdk.js"

let sdk: ZmajSdk

export function getSdk(): ZmajSdk {
	if (sdk) return sdk
	const accessToken = process.env.ACCESS_TOKEN
	if (!accessToken) throw new Error("Missing access token")
	sdk = createSdk("TEST_JWT_AUTH", accessToken)
	return sdk
}
