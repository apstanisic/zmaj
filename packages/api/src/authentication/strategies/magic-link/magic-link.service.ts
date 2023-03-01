import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { RefreshTokenService } from "@api/authentication/refresh-token.service"
import { throw400 } from "@api/common/throw-http"
import { EmailService } from "@api/email/email.service"
import { emsg } from "@api/errors"
import { UsersService } from "@api/users/users.service"
import { HttpException, Injectable } from "@nestjs/common"
import { AuthUser, isEmail, isError } from "@zmaj-js/common"
import { emailTemplates } from "@zmaj-js/email-templates"
import { Response } from "express"

@Injectable()
export class MagicLinkService {
	constructor(
		private readonly config: GlobalConfig,
		private readonly emailService: EmailService,
		private readonly users: UsersService,
		private readonly rtService: RefreshTokenService,
		private readonly authService: AuthenticationService,
	) {}

	/**
	 *
	 * @param destination Email, it's naming convention that package uses
	 * @param href Link that will be used for callback
	 * @returns
	 */
	async sendMagicLink(destination: string, href: string): Promise<void> {
		if (!isEmail(destination)) throw400(503883, emsg.notEmail(destination))

		// ensure consistent duration so user can't figure our if account exist this way
		// const user = await this.users.findActiveUser({ email: destination }).catch(() => undefined)
		const user = await this.users.findUser({ email: destination })

		// if no account, send email that tells them that
		if (!user) {
			await this.emailService.sendEmail({
				to: destination,
				subject: "Sign-in link",
				html: emailTemplates.magicLinkNoAccount({ ZMAJ_APP_NAME: this.config.name }),
				text: `You tried to sign in, but you do not have account with us`,
			})
			return
		}

		// if account not active, inform them that they are not allowed
		if (user.status !== "active") {
			await this.emailService.sendEmail({
				to: user.email,
				subject: "Sign-in link",
				html: emailTemplates.magicLinkForbidden({ ZMAJ_APP_NAME: this.config.name }),
				text: `You are not allowed to sign in.`,
			})
			return
		}

		// this.authz.checkSystem("account", "linkLogin", { user: AuthUser.fromUser(user) }) ||
		//   throw403(793612)

		const link = this.config.joinWithApiUrl(href)

		await this.emailService.sendEmail({
			to: user.email,
			subject: "Sign-in link",
			html: emailTemplates.magicLink({ ZMAJ_APP_NAME: this.config.name, ZMAJ_URL: link }),
			text: `Click this link to finish logging in: ${link}`,
		})
	}

	async verify(payload: { destination: string; [key: string]: any }, done: any): Promise<void> {
		const userOrErr = await this.users
			.findActiveUser({ email: payload.destination })
			.catch((e) => e as HttpException)

		// If user does not exist, or is not active.
		if (isError(userOrErr)) {
			done(userOrErr)
			return
		}

		const authUser = AuthUser.fromUser(userOrErr)

		// not allowed email sign in
		// const allowed = this.authz.checkSystem("account", "linkLogin", { user: authUser })
		// if (!allowed) {
		//   done(new ForbiddenException("951"))
		//   return
		// }

		done(undefined, authUser)
	}

	/**
	 * Sign in user with magic link
	 *
	 * @param res Express response
	 * @param user Logged in user
	 * @param ipAndUa ip and user agent
	 */
	async signIn(
		res: Response,
		user: AuthUser,
		ipAndUa: { ip: string; userAgent?: string },
	): Promise<void> {
		// this.authz.checkSystem("account", "linkLogin", { user }) || throw403(342856432)
		const { refreshToken } = await this.authService.signInWithoutPassword(user, ipAndUa)
		this.rtService.set(res, refreshToken)
	}
}
