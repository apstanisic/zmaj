import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { UserModel } from "../users/user.model"

export class ActivityLogModel extends BaseModel {
	override name = "zmajActivityLog"
	override tableName = "zmaj_activity_log"

	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		/** Action that was performed */
		action: f.text({}),
		/** User that performed action. It's null if user is not logged in */
		userId: f.uuid({ nullable: true }),
		comment: f.text({ nullable: true }),
		/**
		 * Item on which action was performed.
		 * Null if action does not contain item. For example, we can log when we run cron script, or
		 * when user logs in.
		 */
		itemId: f.text({ nullable: true, canUpdate: false }),

		/**
		 * Resource that was used. It can be collection, but it can be auth, cron...
		 * For crud actions it's table on which data was changed. It's not collectionId since collection
		 * can be deleted and then we don't know what collection was used
		 */
		resource: f.text({ canUpdate: false }),
		/**
		 * Ip from which action was performed
		 */
		ip: f.text({ canUpdate: false }),
		/**
		 * User agent
		 */
		userAgent: f.text({ nullable: true, canUpdate: false }),
		/**
		 * Additional info can be any valid json
		 */
		additionalInfo: f.json({ nullable: true }),
		/**
		 * Changes that have been made to item
		 * Official standard for changes on JSON (row in table)
		 * https://tools.ietf.org/html/rfc6902
		 * This enables us that with old data and plus patches have full history
		 */
		// changes: readonly JsonPatch[] | null
		changes: f.json({ nullable: true, canUpdate: false }),
		/**
		 * Data before change. On creation, value is `{}`, `null` if it is not CRUD action
		 */
		// previousData: Struct | null
		previousData: f.json({ nullable: true, canUpdate: false }),

		/**
		 * We are embedding current user info, because in case user changes his email,
		 * deletes his account, we still have info about who made changes.
		 * This prevents admin to delete user data, then deletes all accounts,
		 * and we don't know who did it.
		 */
		// embeddedUserInfo: Pick<AuthUser, "email" | "roleId" | "userId"> | null
		embeddedUserInfo: f.json({ nullable: true, canUpdate: false }),
	}))

	/** User that performed action */
	user = this.manyToOne(() => UserModel, { fkField: "userId" })
}

export type ActivityLog = GetModelFields<ActivityLogModel>
