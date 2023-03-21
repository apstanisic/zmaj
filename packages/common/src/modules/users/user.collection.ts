import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { User, userFields } from "./user.model"
import { BuildType, Fields } from "../crud-types/model-def.type"
import { FieldDef } from "../infra-fields"
import { Struct } from "@common/types"
import { Writable } from "type-fest"
import { PUBLIC_ROLE_ID } from "../roles/role.consts"

export const UserCollection = DefineCollection<User>({
	tableName: "zmaj_users",
	options: {
		authzKey: systemPermissions.users.resource,
		pkColumn: "id",
		pkField: "id",
		displayTemplate: "{email}",
		// _createdAtField: "createdAt",
		label: "Users",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			input: {
				create: {
					simple: {
						fields: [
							"email",
							"firstName",
							"lastName",
							"status",
							"role",
							"password",
							"confirmedEmail",
						],
					},
				},
				edit: { reuseCreate: true },
			},
			list: {
				layout: {
					table: { fields: ["email", "roleId", "status", "firstName", "lastName"] },
				},
				defaultSort: { field: "createdAt", order: "DESC" },
			},
		}),
	},
	fields: userFields,
	relations: {
		authSessions: {
			hidden: true,
			field: "id",
			otherField: "userId",
			otherCollection: "zmajAuthSessions",
			type: "one-to-many",
			reverse: "user",
		},
		files: {
			hidden: true,
			field: "id",
			otherField: "userId",
			otherCollection: "zmajFiles",
			type: "one-to-many",
			reverse: "user",
		},
		role: {
			field: "roleId",
			label: "Role",
			otherField: "id",
			otherCollection: "zmajRoles",
			type: "many-to-one",
			reverse: "users",
		},
	},
})

function customizeFields<F extends Record<string, BuildType<any, any>>>(
	fields: F,
	customized: Partial<Record<keyof F, Partial<FieldDef>>>,
): Struct<Partial<FieldDef>> {
	const shallow = { ...fields }
	for (const [field, custom] of Object.entries(customized)) {
		shallow[field as keyof typeof shallow] = { ...custom, ...shallow[field] } as any
	}
	return shallow as Struct<Partial<FieldDef>>
}

customizeFields(userFields, {
	password: { componentName: "password" },
	email: { componentName: "email" },
	roleId: { isForeignKey: true, dbDefaultValue: PUBLIC_ROLE_ID },
	otpToken: { fieldConfig: { createHidden: true, editHidden: true } },
	status: {
		componentName: "dropdown",
		dbDefaultValue: "disabled",
		fieldConfig: {
			component: {
				dropdown: {
					choices: [
						{ value: "active", label: "Active" },
						{ value: "banned", label: "Banned" },
						{ value: "hacked", label: "Hacked" },
						{ value: "disabled", label: "Disabled" },
						{ value: "invited", label: "Invited" },
						{ value: "emailUnconfirmed", label: "Email Unconfirmed" },
					],
				},
			},
		},
	},
})
