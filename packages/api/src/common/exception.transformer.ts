import { SecurityConfig } from "@api/app/security.config"
import { Injectable, Logger } from "@nestjs/common"
import { ErrorResponse } from "@zmaj-js/common"
import { getUnixTime } from "date-fns"
import { pick } from "radash"
import { z } from "zod"

@Injectable()
export class ExceptionTransformer {
	logger = new Logger(ExceptionTransformer.name)
	constructor(private securityConfig: SecurityConfig) {}

	handleTyped(
		statusCode: number,
		response: Partial<ErrorResponse["error"]>,
		ogError?: Error,
	): ErrorResponse {
		return this.handle(statusCode, response, ogError)
	}

	handle(statusCode: number, response: unknown, ogError?: Error): ErrorResponse {
		const parsed = errorSchema
			.catch(({ error, input }) => {
				this.logger.error("Invalid error thrown")
				this.logger.error({ error, input })
				return { errorCode: 39994, message: "Problem", timestamp: getUnixTime(new Date()) }
			})
			.parse(response)

		const wholeError = { ...parsed, statusCode }

		const error: ErrorResponse["error"] = this.securityConfig.exposeErrorDetails
			? wholeError
			: { ...pick(wholeError, ["timestamp", "statusCode"]), message: "Error" }

		if (statusCode >= 500) {
			this.logger.error(wholeError, ogError)
		}

		return { error }
	}
}

const errorSchema = z
	.union([
		z.record(z.unknown()),
		z.coerce
			.number()
			.int()
			.min(1000)
			.max(100_000_000)
			.transform((v) => ({ code: v })),
	])
	.pipe(
		z.object({
			errorCode: z.number().int().min(1000).default(75300),
			message: z.string().default("Server error"),
			details: z.unknown().optional(),
			timestamp: z.unknown().transform(() => getUnixTime(new Date())),
		}),
	)
// .catch(() => ({ errorCode: 39994, message: "Problem", timestamp: getUnixTime(new Date()) }))
