import { defineCollection } from "../../collection-builder/define-collection"
import { PermissionModel } from "./permission.model"
import { systemPermissions } from "./system-permissions.consts"

export const PermissionCollection = defineCollection(PermissionModel, {
	options: {
		authzKey: systemPermissions.authorization.resource,
	},
	relations: {
		role: {
			otherPropertyName: "permissions",
		},
	},
})
