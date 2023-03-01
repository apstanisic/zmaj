import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationService } from "@api/authentication/authentication.service"
import { Injectable, Logger, OnModuleInit, UnauthorizedException } from "@nestjs/common"
import { getEndpoints, isNil, Struct } from "@zmaj-js/common"
import { Client, Issuer, Strategy, StrategyVerifyCallback, TokenSet } from "openid-client"
import passport from "passport"
import { mapValues } from "radash"
import { OidcConfig } from "./oidc.config"

type DoneFn = (err?: unknown, user?: any) => unknown

@Injectable()
export class OidcStrategy implements OnModuleInit {
	private logger = new Logger(OidcStrategy.name)
	private clients: Struct<Client> = {}

	constructor(
		private config: GlobalConfig,
		private authentication: AuthenticationService,
		private oidcConfig: OidcConfig,
	) {}

	/**
	 * @todo Maybe return as array of objects so we can easily add more data (image...)
	 */
	get clientsAndUrls(): Struct<{ url: string }> {
		return mapValues(this.clients, (_, key) => ({
			url: this.config.joinWithApiUrl(`/auth/oidc/${key}/login`),
		}))
	}

	/**
	 * Verify that response from OIDC provider contain correct info
	 * @param client Client that is used
	 * @param token Token that was returned
	 * @param done Done callback, we can't throw error, we pass it as first param
	 * @returns Nothing, data is passed to callback. AuthUser is passed to done
	 * Wrap everything in try catch block so I can simply throw an error in try,
	 * and then pass it to done in catch
	 */
	async verify(
		client: Client,
		token: TokenSet,
		done: (err?: unknown, user?: unknown) => unknown,
	): Promise<unknown> {
		try {
			if (isNil(token.access_token)) {
				done(new UnauthorizedException(97676))
				return
			}
			const oidcUser = await client.userinfo(token.access_token)

			const user = await this.authentication.oauthSignIn({
				email: String(oidcUser.email),
				emailVerified: oidcUser.email_verified ?? false,
				firstName: oidcUser.given_name,
				lastName: oidcUser.family_name,
				photoUrl: oidcUser.picture,
				// providerUserId: oidcUser.sub,
			})

			return done(null, user)
		} catch (error) {
			return done(error)
		}
	}

	/**
	 * Get all strategies from .env file, and register them with passport
	 * Register all OIDC strategies
	 */
	async onModuleInit(): Promise<void> {
		await this.initClients()
		for (const [name, client] of Object.entries(this.clients)) {
			passport.use(
				name,
				new Strategy(
					{
						client,
						params: { scope: "openid profile email" },
						usePKCE: true,
					},
					((token: TokenSet, done: DoneFn) =>
						void this.verify(client, token, done)) satisfies StrategyVerifyCallback<Struct>,
				),
			)
		}
	}

	/**
	 * Get all OpenID Connect clients from .env
	 */
	private async initClients(): Promise<void> {
		const providers = this.oidcConfig.providers

		this.clients = {}
		for (const item of providers) {
			try {
				const issuer = await Issuer.discover(item.issuer)
				const client = new issuer.Client({
					client_id: item.clientId,
					client_secret: item.clientSecret,
					redirect_uri: this.config.joinWithApiUrl(
						getEndpoints((e) => e.auth.oidc).callback.replace(":provider", item.name),
					),
				})
				this.clients[item.name] = client
			} catch (error) {
				// If some clients could not be instantiated, simply ignore them
				// App should not crash just because some provider has downtime.
				this.logger.error(`Error instantiating OIDC client: ${item.name}`)
				this.logger.error(error)
			}
		}
	}
}
