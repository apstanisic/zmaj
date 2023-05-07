import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { RoleModel } from "../roles/role.model"

export class PermissionModel extends BaseModel {
	override name = "zmajPermissions"
	override tableName = "zmaj_permissions"

	fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true, canUpdate: false }),
		action: f.text({ canUpdate: false }),
		resource: f.text({ canUpdate: false }),
		roleId: f.uuid({ columnName: "role_id", canUpdate: false }),
		fields: f.array({ nullable: true }),
		conditions: f.json({ nullable: true }),
		createdAt: f.createdAt(),
	}))

	role = this.manyToOne(() => RoleModel, { fkField: "roleId" })
}

export type Permission = ModelType<PermissionModel>
