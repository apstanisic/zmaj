import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { castArray, isError } from "@zmaj-js/common"
import AppleStrategy, {
	AuthenticateOptions,
	DecodedIdToken,
	Profile,
	VerifyCallback,
	VerifyFunction,
} from "passport-apple"

interface EnsureProperValidateFn {
	validate: VerifyFunction
}

@Injectable()
export class AppleOAuthStrategy
	extends PassportStrategy(AppleStrategy, "apple")
	implements EnsureProperValidateFn
{
	constructor(
		private authentication: AuthenticationService,
		globalConfig: GlobalConfig,
		authnConfig: AuthenticationConfig,
	) {
		super({
			callbackURL: globalConfig.joinWithApiUrl("/auth/oauth/apple/callback"),
			// temp expect error since apple oauth is not working (have to same token somewhere)
			// It requires this 2 values, so we provide invalid value, and simply disable guard
			// @ts-expect-error
			clientID: authnConfig.oauth.apple?.clientId ?? "invalid",
			// @ts-expect-error
			clientSecret: authnConfig.oauth.apple?.clientSecret ?? "invalid",
			scope: ["email", "profile"],
		} as AuthenticateOptions)
	}
	async validate(
		accessToken: string,
		refreshToken: string,
		idToken: DecodedIdToken,
		profile: Profile,
		done: VerifyCallback,
	): Promise<void> {
		const { name, emails } = profile
		const email = castArray(emails)[0].value

		try {
			const user = await this.authentication.oauthSignIn({
				email: String(email),
				emailVerified: true,
				firstName: name?.givenName,
				lastName: name?.familyName,
			})
			done(null, user)
		} catch (error) {
			done(isError(error) ? error : new InternalServerErrorException(97123))
		}
	}
}
