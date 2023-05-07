import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { PermissionModel } from "../permissions/permission.model"
import { UserModel } from "../users/user.model"

export class RoleModel extends BaseModel {
	override name = "zmajRoles"
	override tableName = "zmaj_roles"

	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		name: f.text({}),
		description: f.text({ nullable: true }),
		requireMfa: f.boolean({ columnName: "require_mfa" }),
		createdAt: f.createdAt(),
	}))

	permissions = this.oneToMany(() => PermissionModel, { fkField: "roleId" })
	users = this.oneToMany(() => UserModel, { fkField: "roleId" })
}

export type Role = ModelType<RoleModel>
