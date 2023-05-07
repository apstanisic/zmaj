import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { SetRequired } from "type-fest"
import { AuthSessionModel } from "../auth-sessions/auth-session.model"
import { FileModel } from "../files"
import { RoleModel } from "../roles/role.model"

export class UserModel extends BaseModel {
	override name = "zmajUsers"
	override tableName = "zmaj_users"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		email: f.text({}),
		password: f.text({ canRead: false, canUpdate: false }),
		firstName: f.text({ nullable: true }),
		lastName: f.text({ nullable: true }),
		roleId: f.uuid({ hasDefault: true }),
		otpToken: f.text({ nullable: true, canRead: false }),
		confirmedEmail: f.boolean({ hasDefault: true }),
		createdAt: f.createdAt({}),
		status: f.enumString({
			enum: ["active", "banned", "hacked", "disabled", "emailUnconfirmed", "invited"],
			hasDefault: true,
		}),
	}))

	role = this.manyToOne(() => RoleModel, { fkField: "roleId" })
	files = this.oneToMany(() => FileModel, { fkField: "userId" })
	authSessions = this.oneToMany(() => AuthSessionModel, { fkField: "userId" })
}

export type User = ModelType<UserModel>

export type UserWithSecret = SetRequired<User, "password" | "otpToken">
