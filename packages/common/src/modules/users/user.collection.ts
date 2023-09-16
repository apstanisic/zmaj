import { codeCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { PUBLIC_ROLE_ID } from "../roles"
import { UserModel } from "./user.model"

export const UserCollection = codeCollection(UserModel, {
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
	fields: {
		email: {
			componentName: "email",
		},
		otpToken: {
			fieldConfig: { createHidden: true, editHidden: true },
		},
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
		roleId: {
			isForeignKey: true,
			dbDefaultValue: PUBLIC_ROLE_ID,
		},
	},
	relations: {
		authSessions: {
			otherColumnName: "userId",
			otherTableName: "zmaj_auth_sessions",
			thisColumnName: "id",
			type: "one-to-many",
			hidden: true,
			otherPropertyName: "user",
		},
		files: {
			otherColumnName: "userId",
			otherTableName: "zmaj_files",
			thisColumnName: "id",
			type: "one-to-many",
			hidden: true,
			otherPropertyName: "user",
		},
		role: {
			otherColumnName: "id",
			otherTableName: "zmaj_roles",
			thisColumnName: "role_id",
			type: "many-to-one",
			label: "Role",
			otherPropertyName: "user",
		},
	},
})
