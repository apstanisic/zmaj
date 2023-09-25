import { ZmajSdk } from "@zmaj-js/client-sdk"
import { createSdk } from "../setup/e2e-sdk.js"

let sdk: ZmajSdk

/**
 * @deprecated
 */
export function getSdk(): ZmajSdk {
	if (sdk) return sdk
	sdk = createSdk("TEST_JWT_AUTH")
	return sdk
}
