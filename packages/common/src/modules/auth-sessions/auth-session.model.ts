import { EntityRef } from "../crud-types/entity-ref.type"
import { User } from "../users/user.model"

export type AuthSession = {
	/**
	 * ID
	 */
	id: string

	/**
	 * Created at
	 */
	createdAt: Date

	/**
	 * User this sessions belongs to
	 */
	userId: string

	/**
	 * Refresh token
	 */
	refreshToken: string

	/**
	 * When was this session last used
	 */
	lastUsed: Date

	/**
	 * Until when is this sessions valid
	 * It can be extended as long as the session does not expire
	 */
	validUntil: Date

	/**
	 * User agent of user when session is created
	 */
	userAgent: string | null

	/**
	 * IP of user when session is created
	 */
	ip: string

	/**
	 * User relation
	 */
	user?: EntityRef<User>
}
