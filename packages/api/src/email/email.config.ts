import { ConfigService } from "@api/config/config.service"
import { Inject, Injectable } from "@nestjs/common"
import { ZodDto } from "@zmaj-js/common"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./email.module-definition"

const EmailConfigSchema = z.object({
	/** Email user */
	user: z.string().min(1).max(200),
	/** Email password */
	password: z.string().min(1).max(200),
	/** Email host */
	host: z.string().min(1).max(500),
	/** Email port */
	port: z.number().int().gte(1).lte(99999),
	/**
	 * Should we use TLS
	 * @see https://nodemailer.com/smtp/#tls-options
	 */
	secure: z.boolean().default(false),
	/**
	 * Is email enabled.
	 * If this is disabled, we won't be able to send confirmation email, password resets...
	 */
	enabled: z.boolean().default(false),
})

export type EmailConfigParams = Partial<z.input<typeof EmailConfigSchema>>

/**
 * User is not required to provide all params, since we will also pull data from .env file
 */
@Injectable()
export class EmailConfig extends ZodDto(EmailConfigSchema) {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) params: EmailConfigParams, //
		configService: ConfigService,
	) {
		const user = params.user ?? configService.get<string>("EMAIL_USER")
		const password = params.password ?? configService.get<string>("EMAIL_PASSWORD")
		const host = params.host ?? configService.get<string>("EMAIL_HOST")
		const port = params.port ?? configService.get<number>("EMAIL_PORT")
		const secure = params.secure ?? configService.get<boolean>("EMAIL_SECURE")
		const enabled = params.enabled ?? configService.get<boolean>("EMAIL_ENABLED") ?? false

		const withEnv: EmailConfigParams = {
			...params,
			user,
			password,
			host,
			port,
			secure,
			enabled, //
		}

		// we are providing default values for this if email is not enabled, since in that case
		// we do not care about values
		// and it enabled user to provide only EMAIL_ENABLE=false in .env
		if (enabled === false) {
			withEnv.user ??= "non_existing"
			withEnv.password ??= "non_existing"
			withEnv.port ??= 3456
			withEnv.host ??= "localhost"
		}

		super(withEnv as Required<EmailConfigParams>)
	}
}
