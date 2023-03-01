import { GlobalConfig } from "@api/app/global-app.config"
import { throw500 } from "@api/common/throw-http"
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { createTransport, SendMailOptions, Transporter } from "nodemailer"
import { EmailConfig } from "./email.config"

export type SendEmailParams = SendMailOptions & {
	/**
	 * defaults to `true`
	 */
	appNameInTitle?: boolean
}
/**
 * Simple mail service. Wrapper around nodemailer.
 * Default values are Ethereal test data and config.
 * Free testing email at:
 * https://ethereal.email
 */
@Injectable()
export class EmailService implements OnModuleInit {
	/**
	 * Object that is in charge of sending mail
	 */
	private transporter?: Transporter

	readonly enabled: boolean

	/** Logger */
	private logger = new Logger(EmailService.name)

	constructor(private config: EmailConfig, private globalConfig: GlobalConfig) {
		this.enabled = this.config.enabled
	}

	/**
	 * Check if connection was successful
	 */
	async onModuleInit(): Promise<void> {
		if (!this.config.enabled) {
			this.logger.warn("Email provider is disabled, not all features will work properly")
			return
		}

		this.transporter = createTransport(
			{
				host: this.config.host,
				port: this.config.port,
				secure: this.config.secure,
				auth: {
					user: this.config.user,
					pass: this.config.password,
				},
			},
			{
				// sender: this.config.user,
				subject: this.globalConfig.name,
				// diff between sender and from??
				// nodemailer says this is better
				from: this.config.user, //
			},
		)

		try {
			await this.transporter.verify()
			this.logger.log("Successfully connected to email provider")
		} catch (error) {
			this.logger.error("Problem connecting to email provider", error)
		}
	}

	/**
	 * Send mail
	 */
	async sendEmail(data: SendEmailParams): Promise<void> {
		if (this.transporter === undefined) throw500(19286)

		const { appNameInTitle, ...rest } = data
		if (appNameInTitle !== false) {
			rest.subject ??= "Email"
			rest.subject += ` - ${this.globalConfig.name}`
		}

		try {
			await this.transporter.sendMail(rest)
		} catch (error) {
			throw500(83799)
		}
	}
}
