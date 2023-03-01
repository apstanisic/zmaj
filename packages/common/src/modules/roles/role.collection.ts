import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections"
import { systemPermissions } from "../permissions"
import { Role } from "./role.model"

export const RoleCollection = DefineCollection<Role>({
	tableName: "zmaj_roles",
	fields: {
		id: { dataType: "uuid", columnName: "id", isPrimaryKey: true },
		name: { dataType: "short-text", columnName: "name", isNullable: false },
		description: { dataType: "long-text", columnName: "description" },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
			canCreate: false,
		},
	},
	relations: {
		permissions: {
			thisColumnName: "id",
			label: "Permissions",
			otherTableName: "zmaj_permissions",
			otherColumnName: "role_id",
			type: "one-to-many",
			otherPropertyName: "role",
		},
		users: {
			thisColumnName: "id",
			label: "Users",
			otherTableName: "zmaj_users",
			otherColumnName: "role_id",
			type: "one-to-many",
			otherPropertyName: "role",
		},
	},
	options: {
		authzKey: systemPermissions.authorization.resource,
		label: "Roles",
		displayTemplate: "{name}",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				fieldsOrder: ["name", "description"],
				defaultSort: { field: "createdAt", order: "ASC" },
				secondaryTemplate: "{createdAt}",
			},
			hideChangesButton: true,
		}),
	},
})
