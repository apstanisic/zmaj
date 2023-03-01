import { ZmajSdk } from "@zmaj-js/client-sdk"
import { generateContext } from "../utils/generate-context"

export const [SdkContextProvider, useSdk] = generateContext<ZmajSdk>(
	undefined, //
	{ throwOnNil: true },
)
