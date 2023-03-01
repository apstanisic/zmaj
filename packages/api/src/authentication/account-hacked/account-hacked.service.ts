import { RedisInstance, RedisService } from "@api/redis/redis.service"
import { SecurityTokensService } from "@api/security-tokens/security-tokens.service"
import { UsersService } from "@api/users/users.service"
import { Injectable } from "@nestjs/common"
import { AuthSessionsService } from "../auth-sessions/auth-sessions.service"
import { AuthenticationConfig } from "../authentication.config"

@Injectable()
export class AccountHackedService {
	/** redis instance for this service */
	private redis?: RedisInstance

	/**
	 *
	 * @param users - We need to update users to set status to "hacked"
	 * @param authSessions - To remove all existing sessions (forcefully log out user)
	 * @param securityTokensService - Remove user tokens if exists (for password, reset...)
	 * @param redisService - To disable user request while jwt is still valid
	 * @param config - Need access to access token ttl
	 */
	constructor(
		private readonly users: UsersService,
		private readonly authSessions: AuthSessionsService,
		private readonly securityTokensService: SecurityTokensService,
		private readonly redisService: RedisService,
		private readonly config: AuthenticationConfig,
	) {
		this.redis = this.redisService.createInstance()
	}

	/**
	 * Disable all access for hacked account
	 *
	 * Remove every login, flag account as hacked, remove every security token.
	 * This can only be reverted by someone who has update access to users status field.
	 * @param userId
	 */
	async disableAccount(userId: string): Promise<void> {
		// Set status as hacked
		await this.users.updateUser({ userId, data: { status: "hacked" } })
		// Remove all sessions
		await this.authSessions.removeAllUserSessions(userId)
		// Remove all token (used for password reset...)
		await this.securityTokensService.deleteUserTokens({ userId })
		// Given how fast redis is, we can check before every request if user is disabled.
		// This provides additional layer of protection
		// This will do nothing if user has disabled redis
		// Value is valid only until all access token expires already given expire,
		// than admin can revert account to active and require password change
		if (this.redis) {
			// It will expire after last access token expires (added 10 seconds just in case)
			// Redis uses seconds, not ms
			const accessTokenTtlInSeconds = Math.ceil(this.config.accessTokenTtlMs / 1000)
			await this.redis.set(
				`zmaj:disable-auth:${userId}`,
				"true",
				"EX",
				accessTokenTtlInSeconds + 10,
			)
		}
	}
}
