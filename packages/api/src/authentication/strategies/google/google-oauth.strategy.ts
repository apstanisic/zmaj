import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { ForbiddenException, Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy, StrategyOptions, VerifyCallback } from "passport-google-oauth20"

/**
 * This is ugly, but it's only way for type safe
 */
interface EnsureProperValidateFn {
	/**
	 * passport google is not passing defined type
	 */
	validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback,
	): Promise<void>
}

@Injectable()
export class GoogleOAuthStrategy
	extends PassportStrategy(Strategy, "google")
	implements EnsureProperValidateFn
{
	constructor(
		private authentication: AuthenticationService,
		authnConfig: AuthenticationConfig,
		globalConfig: GlobalConfig,
	) {
		super({
			callbackURL: globalConfig.joinWithApiUrl("/auth/oauth/google/callback"),
			// It requires this 2 values, so we provide invalid value, and simply disable guard
			clientID: authnConfig.oauth.google?.clientId ?? "invalid",
			clientSecret: authnConfig.oauth.google?.clientSecret ?? "invalid",
			scope: ["email", "profile"],
		} as StrategyOptions)
	}

	/**
	 * Passport will check how many params defined function has, and based on that, pass params
	 */
	async validate(at: string, rt: string, profile: Profile, done: VerifyCallback): Promise<void> {
		const { name, emails } = profile
		const email = emails?.[0]
		if (!email) {
			done(new ForbiddenException(44994))
			return
		}

		try {
			const user = await this.authentication.oauthSignIn({
				email: email.value,
				// when is it false, since google is email provider??
				emailVerified: true, // email.verified === "true",
				firstName: name?.givenName,
				lastName: name?.familyName,
				// providerUserId: id,
			})
			done(null, user)
		} catch (error) {
			done(error as Error)
		}
	}
}
