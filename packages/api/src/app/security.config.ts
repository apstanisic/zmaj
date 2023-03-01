import { Injectable } from "@nestjs/common"
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface"
import { isStruct, ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { ConfigService } from "../config/config.service"

const SecurityConfigSchema = z.object({
	/**
	 * Should we expose error details to user
	 * That includes error codes that helps track where error ocurred
	 * If user wants to expose error only in dev, they can pass something like:
	 * exposeErrorCodes: process.env.NODE_ENV === 'dev'
	 */
	exposeErrorDetails: z.boolean().default(false),
	// showErrorMessage: z.boolean().default(false),
	/**
	 * CORS Origins
	 * @see https://github.com/expressjs/cors
	 */
	corsOrigin: z
		.union([z.string().transform((v) => v.split(",")), z.array(z.string()), z.literal(true)])
		.default([])
		.pipe(
			z.union([
				z.literal(true),
				z.array(z.string().url()), //
			]),
		),
	/**
	 * Cors options that are passed directly to the underlying library
	 * If this value is provided, `cordOrigin` value is ignored
	 */
	advancedCors: z.custom<CorsOptions>((v) => isStruct(v)).optional(),
})

export type SecurityConfigParams = Partial<z.input<typeof SecurityConfigSchema>>

@Injectable()
export class SecurityConfig extends ZodDto(SecurityConfigSchema) {
	constructor(params: SecurityConfigParams, config: ConfigService) {
		const corsOrigin = params.corsOrigin ?? config.get<any>("CORS_ORIGIN")
		super({ ...params, corsOrigin })
	}
}
