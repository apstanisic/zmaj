import { codeCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections"
import { systemPermissions } from "../permissions"
import { RoleModel } from "./role.model"

export const RoleCollection = codeCollection(RoleModel, {
	relations: {
		permissions: {
			label: "Permissions",
			otherPropertyName: "role",
			otherColumnName: "role_id",
			otherTableName: "zmaj_permissions",
			thisColumnName: "id",
			type: "one-to-many",
		},
		users: {
			label: "Users",
			otherPropertyName: "role",
			otherColumnName: "role_id",
			otherTableName: "zmaj_users",
			thisColumnName: "id",
			type: "one-to-many",
		},
	},
	options: {
		authzKey: systemPermissions.authorization.resource,
		authzMustManage: true,
		label: "Roles",
		displayTemplate: "{name}",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				layout: {
					table: { fields: ["name", "description", "requireMfa"] },
				},
				defaultSort: { field: "createdAt", order: "ASC" },
			},
			input: {
				create: {
					type: "simple",
					simple: { fields: ["name", "description", "requireMfa"] },
				},
				edit: {
					type: "simple",
					simple: { fields: ["name", "description", "requireMfa"] },
				},
			},
			hideChangesButton: true,
		}),
	},
})
