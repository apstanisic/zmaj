import { ZmajSdk } from "@zmaj-js/client-sdk"

export function createSdk(name: string, accessToken?: string): ZmajSdk {
	return new ZmajSdk({ url: `${process.env.APP_URL}/api`, name, accessToken })
}
