import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { ForbiddenException, Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy, StrategyOption, VerifyFunction } from "passport-facebook"

/**
 * This is ugly, but it's only way for type safe
 */
type DoneFn = (err: any, user?: any) => any
interface EnsureProperValidateFn {
	validate: VerifyFunction
}

@Injectable()
export class FacebookOAuthStrategy
	extends PassportStrategy(Strategy, "facebook")
	implements EnsureProperValidateFn
{
	constructor(
		private authentication: AuthenticationService,
		authnConfig: AuthenticationConfig,
		globalConfig: GlobalConfig,
	) {
		super({
			callbackURL: globalConfig.joinWithApiUrl("/auth/oauth/facebook/callback"),
			// It requires this 2 values, so we provide invalid value, and simply disable guard
			clientID: authnConfig.oauth.facebook?.clientId ?? "invalid",
			clientSecret: authnConfig.oauth.facebook?.clientSecret ?? "invalid",
			scope: ["email", "profile"],
		} as StrategyOption)
	}

	/**
	 * Passport will check how many params defined function has, and based on that, pass params
	 */
	async validate(at: string, rt: string, profile: Profile, done: DoneFn): Promise<void> {
		// const [at, rt, profile, done] = params
		const { name, emails } = profile
		const email = emails?.[0]
		if (!email) {
			done(new ForbiddenException(44994))
			return
		}

		try {
			const user = await this.authentication.oauthSignIn({
				email: email.value,
				emailVerified: true,
				firstName: name?.givenName,
				lastName: name?.familyName,
			})
			done(null, user)
		} catch (error) {
			done(error as Error)
		}
	}
}
