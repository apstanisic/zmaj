import { GlobalConfig } from "@api/app/global-app.config"
import { DtoBody } from "@api/common/decorators/dto-body.decorator"
import { ParseStringPipe } from "@api/common/parse-string.pipe"
import { throw403 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Controller, Get, Post, Query, Redirect } from "@nestjs/common"
import { AuthUser, SignUpDto, ZodDto, endpoints } from "@zmaj-js/common"
import { z } from "zod"
import { AuthenticationConfig } from "../authentication.config"
import { GetUser } from "../get-user.decorator"
import { SignUpService } from "./sign-up.service"

const ep = endpoints.auth.signUp

type RedirectResponse = { url: string; statusCode: number }

class ChangeSignUpAllowed extends ZodDto(z.object({ allowed: z.boolean() })) {}
// class ChangeDefaultRole extends ZodDto(z.object({ roleId: z.string().uuid() })) {}

@Controller(ep.$base)
export class SignUpController {
	constructor(
		private service: SignUpService,
		private config: GlobalConfig,
		private authConfig: AuthenticationConfig,
	) {}

	/**
	 * This does not log in user, you have to make separate request for that
	 */
	@Post(ep.signUp)
	async signUp(
		@DtoBody(SignUpDto) data: SignUpDto,
		@GetUser() signedInUser?: AuthUser,
	): Promise<AuthUser> {
		// logged in user can't create new account while logged in
		if (signedInUser) throw403(9074231, emsg.alreadySignedIn)
		const created = await this.service.signUp(data)
		return AuthUser.fromUser(created)
	}

	@Redirect()
	@Get(ep.confirmEmail)
	async confirmEmail(@Query("token", ParseStringPipe) token: string): Promise<RedirectResponse> {
		await this.service.confirmEmail(token)

		return {
			url: this.config.urls.adminPanel,
			statusCode: 303,
		}
	}

	@Get(ep.isAllowed)
	async isSignUpAllowed(): Promise<{ allowed: boolean }> {
		return { allowed: this.authConfig.allowSignUp }
	}

	// @Put(ep.setAllowed)
	// async setSignUpAllowed(
	// 	@DtoBody(ChangeSignUpAllowed) body: ChangeSignUpAllowed,
	// 	@GetUser({ required: true }) user: AuthUser,
	// ): Promise<{ allowed: boolean }> {
	// 	await this.service.setSignUpAllowed(body.allowed, user)
	// 	return { allowed: body.allowed }
	// }

	// @Put("default-role")
	// async setDefaultRole(
	//   @DtoBody() body: ChangeDefaultRole,
	//   @GetUser({ required: true }) user: AuthUser,
	// ): Promise<{ allowed: boolean }> {
	//   await this.service.setSignUpAllowed(body.allowed, user)
	//   return { allowed: body.allowed }
	// }
}
