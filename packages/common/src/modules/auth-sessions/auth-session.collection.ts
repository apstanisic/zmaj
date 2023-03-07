import { zodCreate } from "@common/zod"
import { DefineCollection } from "../../collection-builder/define-collection"
import { LayoutConfigSchema } from "../infra-collections"
import { AuthSession } from "./auth-session.model"

export const AuthSessionCollection = DefineCollection<AuthSession>({
	tableName: "zmaj_auth_sessions",

	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
			label: "Logged In At",
		},
		ip: { dataType: "short-text", columnName: "ip" },
		lastUsed: {
			dataType: "datetime",
			columnName: "last_used",
			isUpdatedAt: true,
		},
		refreshToken: { dataType: "short-text", columnName: "refresh_token", canRead: false },
		userAgent: { dataType: "short-text", columnName: "user_agent" },
		validUntil: { dataType: "datetime", columnName: "valid_until" },
		userId: { dataType: "uuid", columnName: "user_id", isForeignKey: true },
	},
	relations: {
		user: {
			thisColumnName: "user_id",
			label: "User",
			otherTableName: "zmaj_users",
			otherColumnName: "id",
			type: "many-to-one",
			otherPropertyName: "authSessions",
		},
	},
	options: {
		authzKey: "zmaj.authSessions",
		label: "User Sessions",
		pkColumn: "id",
		displayTemplate: "{ip} - {lastUsed|date}",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			hideDeleteButton: true,
			hideChangesButton: true,
			hideDisplayAsJsonButton: true,
			list: {
				// hidePagination: true,
				hideDelete: true,
				disableFilter: true,
				quickFilter: false,
				disableMultiSelect: true,
				perPage: { default: 10, options: [10] },
				defaultSort: { field: "lastUsed", order: "DESC" },
				sortableFields: ["createdAt", "lastUsed", "ip"],
				filterableFields: ["createdAt", "lastUsed", "ip"],
				layout: {
					table: { fields: ["lastUsed", "ip", "createdAt"] },
				},
			},
		}),
	},
})
