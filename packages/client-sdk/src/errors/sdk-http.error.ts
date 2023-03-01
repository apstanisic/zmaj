import { AxiosError } from "axios"
import { get } from "radash"
import { SdkError } from "./sdk.error"

export class SdkHttpError extends SdkError {
	constructor(public axiosError: AxiosError) {
		super(
			get(axiosError.response?.data, "error.message") ??
				get(axiosError.response?.data, "message") ??
				axiosError.response?.statusText ??
				axiosError.message,
			{ cause: axiosError.cause },
		)
	}
}
