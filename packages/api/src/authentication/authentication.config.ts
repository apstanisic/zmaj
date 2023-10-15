import { GlobalConfig } from "@api/app/global-app.config"
import { ConfigService } from "@api/config/config.service"
import { Inject, Injectable } from "@nestjs/common"
import { ZodDto, filterStruct } from "@zmaj-js/common"
import ms from "ms"
import { isEmpty } from "radash"
import { z } from "zod"
import { MODULE_OPTIONS_TOKEN } from "./authentication.module-definition"
import { OidcConfigSchema } from "./strategies/oidc/oidc-config.schema"

const OAuthSchema = z.object({
	clientId: z.string(),
	clientSecret: z.string(),
	enabled: z.boolean().default(true),
})

const AuthenticationConfigSchema = z.object({
	/** How long does refresh token lives in ms */
	refreshTokenTtlMs: z.number().gte(1).default(ms("30d")),
	/** How long does access token lives in ms */
	accessTokenTtlMs: z.number().gte(1).default(ms("20m")),
	/**
	 * Where to redirect after oauth/magic-link sign in.
	 * If it's full url (http*), it will use that, otherwise prepend admin panel url
	 * That way it's possible to use api without admin panel
	 */
	signInRedirectPath: z.string().default("#/auth/success-redirect"),
	/** Can user authenticate with basic auth */
	allowBasicAuth: z.boolean().default(false),
	/**
	 * Should we allow jwt access token to be passed as query param
	 * Currently, it's used for getting images in admin panel, but in the future it should be done
	 * with service worker. It's required to be true for admin panel
	 */
	allowJwtInQuery: z.boolean().default(false),
	/**
	 * How can use reset password
	 *
	 * TODO Add option to notify admin, so that admin can set temp password, and notify user.
	 * That would require some kind of notifications system, with option to send to email
	 */
	passwordReset: z.enum(["forbidden", "reset-email"]).default("forbidden"),
	// should we allow sign up with oauth, or just sign in
	/**
	 * Can user sign up using oauth, or they can only sign in if they already have account
	 * If sign up is disabled, this option is ignored
	 */
	allowOAuthSignUp: z.boolean().default(false),
	/** Should we require that email be verified before user can sign in */
	requireEmailConfirmation: z.boolean().default(true),
	/** Should we encrypt password hash. If hash is encrypted, you have to use same `secretKey`.  */
	encryptPasswordHash: z.boolean().default(true),
	/**
	 * Can user sign up
	 * - true: User is allowed to sign up
	 * - false: User is not allowed to sign up
	 */
	allowSignUp: z.boolean().default(false),
	/**
	 * OpenID Connect providers
	 * @deprecated Not enabled currently. It does nothing
	 */
	oidc: OidcConfigSchema.default({ providers: [] }),
	/**
	 * OAuth providers
	 * Currently google and facebook are supported,
	 * TODO Add apple. Apple returns used email only on first sign in, so we have to store that data somewhere
	 */
	oauth: z
		.object({
			// apple: OAuthSchema,
			google: OAuthSchema,
			facebook: OAuthSchema,
		})
		.partial()
		.default({}),

	/**
	 * Should we allow REST API to create admin.
	 * If enabled, it is only allowed if there is no admin, and admin wasn't created in the past.
	 * If disabled, you can create admin with cli, or doing it yourself with created server by
	 * accessing services.
	 */
	allowAdminInitialize: z.boolean().default(false),
	/** */
	exposePublicInfo: z.boolean().default(false),
})

export type AuthenticationConfigParams = z.input<typeof AuthenticationConfigSchema>

@Injectable()
export class AuthenticationConfig extends ZodDto(AuthenticationConfigSchema) {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) params: AuthenticationConfigParams,
		private globalConfig: GlobalConfig,
		configService: ConfigService,
	) {
		type OAuthPartial = Partial<
			Record<"apple" | "facebook" | "google", { clientId?: string; clientSecret?: string }>
		>

		const merged: OAuthPartial = {
			// apple: {
			// 	clientId: params.oauth?.apple?.clientId ?? configService.get("APPLE_OAUTH_CLIENT_ID"),
			// 	clientSecret:
			// 		params.oauth?.apple?.clientSecret ?? configService.get("APPLE_OAUTH_CLIENT_SECRET"),
			// },
			facebook: {
				clientId:
					params.oauth?.facebook?.clientId ??
					configService.get("FACEBOOK_OAUTH_CLIENT_ID"),
				clientSecret:
					params.oauth?.facebook?.clientSecret ??
					configService.get("FACEBOOK_OAUTH_CLIENT_SECRET"),
			},
			google: {
				clientId:
					params.oauth?.google?.clientId ?? configService.get("GOOGLE_OAUTH_CLIENT_ID"),
				clientSecret:
					params.oauth?.google?.clientSecret ??
					configService.get("GOOGLE_OAUTH_CLIENT_SECRET"),
			},
		}
		const notEmpty = filterStruct(merged, (provider) => {
			if (provider === undefined) return false
			const nonEmptyValues = filterStruct(provider, (val) => val !== undefined)
			return !isEmpty(nonEmptyValues)
		})

		super({ ...params, oauth: notEmpty as any })
	}

	get fullSignInRedirectPath(): string {
		if (this.signInRedirectPath.startsWith("http")) return this.signInRedirectPath
		return this.globalConfig.joinWithAdminPanelUrl(this.signInRedirectPath)
	}
}
