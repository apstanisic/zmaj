import { DefineCollection } from "../../collection-builder/define-collection"
import { Permission } from "./permission.model"
import { systemPermissions } from "./system-permissions.consts"

export const PermissionCollection = DefineCollection<Permission>({
	tableName: "zmaj_permissions",
	options: {
		authzKey: systemPermissions.authorization.resource,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		action: { dataType: "short-text", columnName: "action", canUpdate: false },
		resource: { dataType: "short-text", columnName: "resource", canUpdate: false },
		roleId: { dataType: "uuid", columnName: "role_id", canUpdate: false, isForeignKey: true },
		// fields: { dataType: "json", columnName: "fields" },
		fields: { dataType: "array", columnName: "fields", dbRawDataType: "character varying[]" },
		conditions: { dataType: "json", columnName: "conditions" },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false }, // createDate: true, update: false
	},
	relations: {
		role: {
			type: "many-to-one",
			thisColumnName: "role_id",
			otherTableName: "zmaj_roles",
			otherColumnName: "id",
			otherPropertyName: "permissions",
		},
	},
})
