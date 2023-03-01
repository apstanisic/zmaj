import axios, { AxiosError } from "axios"
import { SdkHttpError } from "./sdk-http.error"
import { SdkError } from "./sdk.error"

export function sdkThrow(err?: string | AxiosError | Error): never {
	if (axios.isAxiosError(err)) throw new SdkHttpError(err)
	if (err instanceof Error) throw new SdkError(err.message, { cause: err })
	throw new SdkError(err)
}
