import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { UserModel } from "../users/user.model"

export class AuthSessionModel extends BaseModel {
	override name = "zmajAuthSessions"
	override tableName = "zmaj_auth_sessions"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),

		createdAt: f.createdAt({}),

		/**
		 * User this sessions belongs to
		 */
		userId: f.uuid({}),

		/**
		 * Refresh token
		 */
		refreshToken: f.text({ canRead: false }),

		/**
		 * When was this session last used
		 */
		lastUsed: f.dateTime({ columnName: "last_used" }),

		/**
		 * Until when is this sessions valid
		 * It can be extended as long as the session does not expire
		 */
		validUntil: f.dateTime({ columnName: "valid_until" }),

		/**
		 * User agent of user when session is created
		 */
		userAgent: f.text({ nullable: true }),

		/**
		 * IP of user when session is created
		 */
		ip: f.text({}),
	}))

	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type AuthSession = ModelType<AuthSessionModel>
