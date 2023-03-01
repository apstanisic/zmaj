import { GlobalConfig } from "@api/app/global-app.config"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { ParseEmailPipe } from "@api/common/parse-email.pipe"
import { Body, Controller, Get, ParseUUIDPipe, Post, Put, Query, Res } from "@nestjs/common"
import { endpoints, PasswordResetDto, qsStringify, type Email, type UUID } from "@zmaj-js/common"
import type { Response } from "express"
import { PasswordResetService } from "./password-reset.service"

const ep = endpoints.auth.passwordReset
/**
 * Reset password controller
 *
 * It goes like this
 * 1. user sends request that he/she has forgotten password
 *    We send password recovery email
 * 2. User see email and click on provided url.
 *    We render password reset form
 * 3. User fills form and send her to us with token that was in query url in email
 *    We reset password.
 */
@Controller(ep.$base)
export class PasswordResetController {
	constructor(
		private readonly service: PasswordResetService,
		private readonly config: GlobalConfig,
	) {}

	/**
	 * Request to create new password
	 * Send email with reset instruction.
	 * 1st step
	 */
	@Post(ep.request)
	async sendPasswordRecoveryMail(
		@Body("email", ParseEmailPipe) email: Email,
	): Promise<{ email: string }> {
		await this.service.sendResetPasswordEmail(email)
		return { email }
	}

	/**
	 * We are currently redirecting to app, but we can ssr in the future
	 * Render form for user to reset password
	 * 2st step
	 */
	@Get(ep.redirectToForm)
	renderPasswordResetForm(
		@Res() res: Response,
		@Query("email", ParseEmailPipe) email: Email,
		@Query("token", ParseUUIDPipe) token: UUID,
	): void {
		const query = qsStringify({ email, token })
		const url = this.config.joinWithAdminPanelUrl(`#/auth/password-reset?${query}`)

		res.redirect(303, url)
	}

	/**
	 * Method that reset the user password and sets it in db.
	 * This should be called when user fills a form with new password
	 * and pass everything in body
	 * 3rd step
	 */
	@Put(ep.reset)
	async resetPassword(
		@DtoBody(PasswordResetDto) body: PasswordResetDto,
	): Promise<{ email: string }> {
		await this.service.setNewPassword(body)
		return { email: body.email }
	}
}
