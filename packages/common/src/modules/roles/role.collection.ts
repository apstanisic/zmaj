import { defineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections"
import { systemPermissions } from "../permissions"
import { RoleModel } from "./role.model"

export const RoleCollection = defineCollection(RoleModel, {
	relations: {
		permissions: {
			label: "Permissions",
			otherPropertyName: "role",
		},
		users: {
			label: "Users",
			otherPropertyName: "role",
		},
	},
	options: {
		authzKey: systemPermissions.authorization.resource,
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
