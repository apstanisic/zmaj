import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorResponse } from "@zmaj-js/common"
import { getUnixTime } from "date-fns"
import { isEmpty, mapValues } from "radash"
import { ZodError } from "zod"

export class ValidationException extends HttpException {
	constructor(error: ZodError, options?: { zmajCode?: number; httpCode?: HttpStatus }) {
		const httpCode = options?.httpCode ?? 400

		const errors = Object.fromEntries(error.issues.map((iss) => [iss.path.join("."), iss.message]))

		const details = Object.values(mapValues(errors, (v, k: string) => `Field "${k}": ${v}`))

		const message = isEmpty(details) ? "Failed Validation" : `Failed Validation. ${details[0]}`

		super(
			{
				errorCode: options?.zmajCode ?? 59903,
				message,
				statusCode: httpCode,
				timestamp: getUnixTime(new Date()),
				details: errors,
			} as ErrorResponse["error"],
			httpCode ?? 400,
		)
	}
}
