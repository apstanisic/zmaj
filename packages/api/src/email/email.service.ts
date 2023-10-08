import { GlobalConfig } from "@api/app/global-app.config"
import { throw500 } from "@api/common/throw-http"
import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { SendMailOptions, Transporter, createTransport } from "nodemailer"
import { SetRequired } from "type-fest"
import { EmailConfig } from "./email.config"

export type SendEmailParams = SetRequired<SendMailOptions, "subject" | "to"> & {
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
	/** Logger */
	private logger = new Logger(EmailService.name)

	/**
	 * Object that is in charge of sending mail
	 */
	private transporter?: Transporter

	/**
	 * Used for external services to find out if email service is enabled
	 */
	readonly enabled: boolean

	constructor(
		private config: EmailConfig,
		private globalConfig: GlobalConfig,
	) {
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
				// Docs say to use `from`, not `sender`:
				// https://nodemailer.com/message/#routing-options
				from: this.config.user, //
			},
		)

		try {
			await this.transporter.verify()
			this.logger.log("Successfully connected to email provider")
		} catch (error) {
			this.transporter = undefined
			this.logger.error("Problem connecting to email provider. Email is disabled.", error)
		}
	}

	/**
	 * Send mail
	 */
	async sendEmail(data: SendEmailParams): Promise<void> {
		/* If email is not enabled, throw */
		if (!this.transporter) throw500(19286)

		const { appNameInTitle = true, ...params } = data
		if (appNameInTitle) {
			params.subject += ` - ${this.globalConfig.name}`
		}

		try {
			await this.transporter.sendMail(params)
		} catch (error) {
			throw500(83799)
		}
	}
}
