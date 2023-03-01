import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { UserAgent } from "@api/common/decorators/user-agent.decorator"
import { Controller, Get, Ip, Post, Req, Res, UseGuards } from "@nestjs/common"
import { AuthUser, endpoints } from "@zmaj-js/common"
import type { Request, Response } from "express"
import { GetUser } from "../../get-user.decorator"
import { MagicLinkGuard } from "./magic-link.guard"
import { MagicLinkService } from "./magic-link.service"
import { MagicLinkStrategy } from "./magic-link.strategy"

const ep = endpoints.auth.magicLink
/**
 * Magic link controller
 * POST request will send magic link with email, GET request will attempt to log user in.
 */
@Controller(ep.$base)
export class MagicLinkController {
	constructor(
		private readonly authConfig: AuthenticationConfig,
		private readonly strategy: MagicLinkStrategy,
		private readonly service: MagicLinkService,
	) {}

	/**
	 * Magic Login requires this method. It uses it for sending email
	 * and returns some json response.
	 */
	@Post(ep.sendLink)
	async magicLoginHandler(@Req() req: Request, @Res() res: Response): Promise<void> {
		// strategy will send response to the user
		// FIXME IDK Why there is no ts here
		this.strategy["send"](req, res)
	}

	/**
	 * Url that is clicked from email. This will redirect user to page specified
	 * in .env file. Only thing this does is setting refresh-token,
	 * Post request will send magic link in email, get will try to log user in.
	 */
	@Get(ep.callback)
	@UseGuards(MagicLinkGuard)
	async magicLoginCallback(
		@Res() res: Response,
		@GetUser({ required: true }) user: AuthUser,
		@Ip() ip: string,
		@UserAgent() userAgent?: string,
	): Promise<void> {
		await this.service.signIn(res, user, { ip, userAgent })
		res.redirect(303, this.authConfig.fullSignInRedirectPath)
	}
}
