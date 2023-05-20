import { AuthorizationService } from "@api/authorization/authorization.service"
import { throw400, throw403, throw404 } from "@api/common/throw-http"
import { emsg } from "@api/errors"
import { Injectable } from "@nestjs/common"
import {
	AuthSession,
	AuthSessionModel,
	AuthUser,
	GetManyOptions,
	PublicAuthSession,
	UrlQuerySchema,
	pageToOffset,
	type UUID,
} from "@zmaj-js/common"
import { OrmRepository, RepoManager } from "@zmaj-js/orm"
import { isEmpty } from "radash"
import { AuthSessionsService } from "./auth-sessions.service"
import { UserAgentService } from "./user-agent.service"

/**
 * This is separate class so that we don't expose this methods to other modules,
 * in most cases only non-api service should be used
 */
@Injectable()
export class AuthSessionsApiService {
	repo: OrmRepository<AuthSessionModel>
	constructor(
		private readonly repoManager: RepoManager,
		private readonly authz: AuthorizationService,
		private readonly userAgentService: UserAgentService,
		private readonly service: AuthSessionsService,
	) {
		this.repo = this.repoManager.getRepo(AuthSessionModel)
	}

	/**
	 * Get sessions for logged in user
	 *
	 * Provides user ability to see all his active logins
	 * @param user - Currently logged in user
	 * @param req - Current request. Used for pagination
	 * @returns Active sessions for logged in user
	 *
	 */
	async getUserSessions(
		user: AuthUser,
		options: GetManyOptions,
	): Promise<{ data: PublicAuthSession[]; count: number }> {
		// Can if user read this
		this.authz.checkSystem("account", "readSessions", { user }) || throw403(409721, emsg.noAuthz)
		const query = UrlQuerySchema.parse(options)

		const [sessions, count] = await this.repo.findAndCount({
			where: { userId: user.userId },
			fields: {
				createdAt: true,
				id: true,
				lastUsed: true,
				userAgent: true,
				ip: true,
				userId: true,
			},
			limit: query.limit,
			offset: pageToOffset(query.page, query.limit), // req.query.offset ?? 0,
			orderBy: isEmpty(query.sort) ? { createdAt: "DESC" } : query.sort,
		})

		return {
			data: sessions.map((session) => this.userAgentService.expandPublicSession(session)),
			count,
		}
	}

	/**
	 *
	 * @param sessionId
	 * @param user
	 * @returns Requested user session
	 */
	async findById(sessionId: UUID, user: AuthUser): Promise<PublicAuthSession> {
		this.authz.checkSystem("account", "readSessions", { user }) || throw403(94732, emsg.noAuthz)

		const session = await this.repo.findOne({
			where: { userId: user.userId, id: sessionId },
			fields: {
				lastUsed: true,
				ip: true,
				userAgent: true,
				id: true,
				userId: true,
				createdAt: true,
			},
		})

		if (!session) throw404(96751, emsg.notFound("Session"))
		return this.userAgentService.expandPublicSession(session)
	}

	/**
	 * Remove session by it's ID
	 *
	 * This method is used when user manually deletes sessions (not by logging out)
	 * @param sessionId Session ID
	 * @param user Logged in user, required because this is only valid use case
	 * @returns Deleted session
	 */
	async removeById(sessionId: UUID, user: AuthUser): Promise<PublicAuthSession> {
		this.authz.checkSystem("account", "deleteSessions", { user }) || throw403(907231, emsg.noAuthz)

		const [deleted] = await this.repo.deleteWhere({
			where: { id: sessionId, userId: user.userId },
		})
		if (!deleted) throw404(93242, emsg.notFound("Session"))
		return this.userAgentService.expandPublicSession(this.extractPublicData(deleted))
	}

	private extractPublicData(session: AuthSession): PublicAuthSession {
		return {
			createdAt: session.createdAt,
			ip: session.ip,
			id: session.id,
			lastUsed: session.lastUsed,
			userAgent: session.userAgent,
			userId: session.userId,
		}
	}

	async getCurrentSession(rt?: string, user?: AuthUser): Promise<PublicAuthSession> {
		if (!rt) throw400(732993, emsg.authRequired)
		const session = await this.service.findByRefreshToken(rt)
		if (session.userId !== user?.userId) throw400(930003, emsg.authRequired)
		return this.userAgentService.expandPublicSession(this.extractPublicData(session))
	}
}
