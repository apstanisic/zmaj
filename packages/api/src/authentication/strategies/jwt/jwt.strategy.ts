import { GlobalConfig } from "@api/app/global-app.config"
import { AuthenticationConfig } from "@api/authentication/authentication.config"
import { throw403, throw500 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { RedisInstance, RedisService } from "@api/redis/redis.service"
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { AuthUser, AuthUserType } from "@zmaj-js/common"
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	redis?: RedisInstance
	constructor(
		config: GlobalConfig,
		redis: RedisService,
		authnConfig: AuthenticationConfig, //
	) {
		const extractors = [ExtractJwt.fromAuthHeaderAsBearerToken()]

		if (authnConfig.allowJwtInQuery) {
			extractors.push(ExtractJwt.fromUrlQueryParameter("accessToken"))
		}

		super({
			jwtFromRequest: ExtractJwt.fromExtractors(extractors),
			secretOrKey: config.secretKey,
		} as StrategyOptions)

		this.redis = redis.createInstance()
	}

	/**
	 * We are receiving bearer token with auth user, we only need to check if user token
	 * is disabled
	 */
	async validate(payload: AuthUserType): Promise<AuthUser> {
		// Check if token is revoked (only if redis is enabled)
		if (this.redis) {
			const disabled = await this.redis.get(`zmaj:disabled-jwt:${payload.userId}`)
			if (disabled !== null) throw403(62789, emsg.accountDisabled)
		}

		try {
			return new AuthUser(payload)
		} catch (error) {
			throw500(874236)
		}
	}
}
