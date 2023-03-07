import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { PUBLIC_ROLE_ID } from "../roles"
import { User } from "./user.model"

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
	fields: {
		id: { dataType: "uuid", columnName: "id", isPrimaryKey: true },
		confirmedEmail: { dataType: "boolean", columnName: "confirmed_email", isNullable: false },
		email: {
			dataType: "short-text",
			columnName: "email",
			isNullable: false,
			componentName: "email",
		},
		firstName: { dataType: "short-text", columnName: "first_name" },
		lastName: { dataType: "short-text", columnName: "last_name" },
		otpToken: {
			canRead: false,
			dataType: "short-text",
			columnName: "otp_token",
			fieldConfig: { createHidden: true, editHidden: true },
		},
		status: {
			dataType: "short-text",
			columnName: "status",
			componentName: "dropdown",
			isNullable: false,
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
			dataType: "uuid",
			columnName: "role_id",
			isNullable: false,
			isForeignKey: true,
			dbDefaultValue: PUBLIC_ROLE_ID,
			hasDefaultValue: true,
		},
		// photoUrl: {
		//   dataType: "long-text",
		//   columnName: "photo_url",
		//   fieldConfig: { showHidden: true, editHidden: true, createHidden: true },
		// },
		// passwordExpiresAt: { dataType: "datetime", columnName: "password_expires_at" },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
			canCreate: false,
			// beforeCreate: ["CURRENT_DATE"],
		},
		password: {
			dataType: "short-text",
			columnName: "password",
			canCreate: true,
			canUpdate: false,
			canRead: false,
			// fieldConfig: {}
			componentName: "password",
		},
	},
	relations: {
		authSessions: {
			hidden: true,
			thisColumnName: "id",
			otherColumnName: "user_id",
			otherTableName: "zmaj_auth_sessions",
			type: "one-to-many",
			otherPropertyName: "user",
		},
		files: {
			hidden: true,
			thisColumnName: "id",
			otherColumnName: "user_id",
			otherTableName: "zmaj_files",
			type: "one-to-many",
			otherPropertyName: "user",
		},
		role: {
			thisColumnName: "role_id",
			label: "Role",
			otherColumnName: "id",
			otherTableName: "zmaj_roles",
			type: "many-to-one",
			otherPropertyName: "user",
		},
	},
})
