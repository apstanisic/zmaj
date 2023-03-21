import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { ExtractType, Fields } from "../crud-types/model-def.type"
import { OneToMany } from "../crud-types/relation.types"
import { LayoutConfigSchema } from "../infra-collections"
import { Permission, systemPermissions } from "../permissions"
import { User } from "../users"

export const roleFields = Fields((f) => ({
	id: f.uuid({ isPk: true }),
	createdAt: f.createdAt({}),
	name: f.shortText({}),
	description: f.longText({ nullable: true }),
	requireMfa: f.boolean({}),
}))

export type Role = ExtractType<typeof roleFields> & {
	users?: OneToMany<User>
	permissions?: OneToMany<Permission>
}

export const RoleCollection = DefineCollection<Role>({
	tableName: "zmaj_roles",
	fields: roleFields,
	relations: {
		permissions: {
			type: "one-to-many",
			field: "id",
			otherCollection: "zmajPermissions",
			otherField: "roleId",
			reverse: "role",
			label: "Permissions",
		},
		users: {
			type: "one-to-many",
			field: "id",
			label: "Users",
			otherCollection: "zmajUsers",
			otherField: "roleId",
			reverse: "role",
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
