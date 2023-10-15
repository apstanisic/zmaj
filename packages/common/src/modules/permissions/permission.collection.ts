import { codeCollection } from "../../collection-builder/define-collection"
import { PermissionModel } from "./permission.model"
import { systemPermissions } from "./system-permissions.consts"

export const PermissionCollection = codeCollection(PermissionModel, {
	options: {
		authzKey: systemPermissions.authorization.resource,
		authzMustManage: true,
	},
	relations: {
		role: {
			otherPropertyName: "permissions",
			type: "many-to-one",
			otherColumnName: "id",
			otherTableName: "zmaj_roles",
			thisColumnName: "role_id",
		},
	},
})
