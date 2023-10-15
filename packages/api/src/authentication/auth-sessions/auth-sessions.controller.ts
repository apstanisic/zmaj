import { SetSystemPermission } from "@api/authorization/set-system-permission.decorator"
import { GetCookie } from "@api/common/decorators/get-cookie.decorator"
import { SetCollection } from "@api/common/decorators/set-collection.decorator"
import { wrap } from "@api/common/wrap"
import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common"
import {
	AuthSessionCollection,
	AuthUser,
	Data,
	PublicAuthSession,
	REFRESH_COOKIE_NAME,
	endpoints,
	type Struct,
	type UUID,
} from "@zmaj-js/common"
import { GetUser } from "../get-user.decorator"
import { AuthSessionsApiService } from "./auth-sessions.api.service"

const ep = endpoints.auth.authSessions

/**
 * For deleting sessions by access token (logout) use AuthenticationController
 * This is for user screen when he can delete session that he/she no longer uses.
 */
@Controller(ep.$base)
@SetCollection(AuthSessionCollection)
export class AuthSessionsController {
	constructor(
		private readonly apiService: AuthSessionsApiService, //
	) {}

	/** Get all active sessions */
	@SetSystemPermission("account", "readSessions")
	@Get(ep.userSessions)
	async getSessions(
		@GetUser({ required: true }) user: AuthUser,
		@Query() query: Struct,
	): Promise<{ count: number; data: PublicAuthSession[] }> {
		return this.apiService.getUserSessions(user, query)
	}

	/**
	 * Get current session id for
	 */
	@SetSystemPermission("account", "readSessions")
	@Get(ep.userCurrentSession)
	async getCurrentSessionId(
		@GetUser({ required: true }) user: AuthUser,
		@GetCookie(REFRESH_COOKIE_NAME) rt?: string,
	): Promise<Data<PublicAuthSession>> {
		return wrap(this.apiService.getCurrentSession(rt, user))
	}

	/**
	 *
	 * @param user
	 * @param id
	 * @returns
	 */
	@SetSystemPermission("account", "readSessions")
	@Get(ep.userSessionById)
	async findById(
		@GetUser({ required: true }) user: AuthUser,
		@Param("id", ParseUUIDPipe) id: UUID,
	): Promise<Data<PublicAuthSession>> {
		return wrap(this.apiService.findById(id, user))
	}

	/**
	 * Delete session
	 */
	@SetSystemPermission("account", "deleteSessions")
	@Delete(ep.userSessionDeleteById)
	async revoke(
		@Param("id", ParseUUIDPipe) id: UUID,
		@GetUser({ required: true }) user: AuthUser,
	): Promise<Data<PublicAuthSession>> {
		return wrap(this.apiService.removeById(id, user))
	}
}
