import { CrudRequest } from "@api/common/decorators/crud-request.decorator"
import { throw401, throw403 } from "@api/common/throw-http"
import { OrmRepository } from "@api/database/orm-specs/OrmRepository"
import { RepoManager } from "@api/database/orm-specs/RepoManager"
import { EncryptionService } from "@api/encryption/encryption.service"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
	AuthSession,
	AuthSessionCollection,
	AuthSessionSchema,
	AuthUser,
	zodCreate,
} from "@zmaj-js/common"
import { addMilliseconds, isPast, subYears } from "date-fns"
import { v4 } from "uuid"
import { AuthenticationConfig } from "../authentication.config"

@Injectable()
export class AuthSessionsService {
	repo: OrmRepository<AuthSession>
	constructor(
		private readonly encryption: EncryptionService,
		private readonly repoManager: RepoManager,
		private readonly config: AuthenticationConfig,
	) {
		this.repo = this.repoManager.getRepo(AuthSessionCollection)
	}

	/**
	 * Create auth session and refresh token
	 *
	 * This will store refresh token in db, and return encrypted version to user so user
	 * can request new access tokens
	 *
	 * @param params Param to create user account
	 * @returns Encrypted refresh token
	 */
	async createSession(
		user: AuthUser,
		params: Pick<CrudRequest, "ip" | "userAgent"> & { expiresAt?: Date },
	): Promise<string> {
		const rt = await this.generateRefreshToken()

		const session = zodCreate(AuthSessionSchema, {
			userAgent: params.userAgent,
			ip: params.ip,
			userId: user.userId,
			validUntil: params.expiresAt ?? addMilliseconds(new Date(), this.config.refreshTokenTtlMs),
			refreshToken: rt.raw,
		})

		await this.repo.createOne({ data: session })

		return rt.encrypted
	}

	/**
	 * Find session with provided refresh token
	 *
	 * Used for extending session validity.
	 * We pass refresh token as cookie, and api extends validity
	 *
	 * @param refreshToken encrypted refresh token
	 * @returns Session to which this rt is tied
	 */
	async findByRefreshToken(refreshToken: string): Promise<AuthSession> {
		const decryptedRt = await this.encryption.decrypt(refreshToken)
		// I am filtering by refresh token, but I'm not getting it
		const session = await this.repo.findOne({ where: { refreshToken: decryptedRt } })
		if (!session) throw403(7793, emsg.notSignedIn)
		return session
	}

	/**
	 * Remove session with by refresh token. Used when user is logging out
	 *
	 * @param encryptedRefreshToken Encrypted refresh token
	 * @returns Deleted `AuthSession`
	 */
	async removeByRefreshToken(encryptedRefreshToken: string): Promise<AuthSession> {
		const session = await this.findByRefreshToken(encryptedRefreshToken)
		return this.repo.deleteById({ id: session.id })
	}

	/**
	 * Delete all user sessions
	 *
	 * Used when account is hacked
	 *
	 * @param userId User which sessions should be deleted
	 * @returns Deleted sessions
	 */
	async removeAllUserSessions(userId: string): Promise<AuthSession[]> {
		return this.repo.deleteWhere({ where: { userId } })
	}

	/**
	 * Generate refresh token
	 *
	 * Generate refresh token, and encrypt it. Return both versions.
	 * Encrypted version should be set as a cookie, and raw should be stored in db.
	 * This way, in case db is hacked, user can have refresh token, but can't generate
	 * access tokens without encryption key
	 * @returns Object containing both encrypted and raw version of refresh token.
	 */
	private async generateRefreshToken(): Promise<{ raw: string; encrypted: string }> {
		const raw = v4()
		const encrypted = await this.encryption.encrypt(raw)
		return { raw, encrypted }
	}

	/**
	 * Extend auth session lifetime
	 *
	 * Change when session expires, and when is last used
	 * Used by authentication service, when getting new access token
	 *
	 * @param encryptedRefreshToken Refresh token
	 * @returns Updated session
	 */
	async extendSessionValidity(encryptedRefreshToken: string): Promise<AuthSession> {
		const session = await this.findByRefreshToken(encryptedRefreshToken)

		if (isPast(session.validUntil)) throw401(18321, emsg.emailTokenExpired)

		return this.repo.updateById({
			id: session.id,
			changes: {
				validUntil: addMilliseconds(new Date(), this.config.refreshTokenTtlMs),
				lastUsed: new Date(),
			},
		})
	}

	/**
	 * Delete sessions that are expired more than a year before
	 */
	@Cron(CronExpression.EVERY_3_HOURS)
	async __deleteOldSessions(): Promise<void> {
		await this.repo.deleteWhere({
			where: {
				validUntil: { $lt: subYears(new Date(), 1) },
			},
		})
	}
}
