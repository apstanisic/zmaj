import { zodCreate } from "@common/zod"
import { codeCollection } from "../../collection-builder/define-collection"
import { LayoutConfigSchema } from "../infra-collections"
import { AuthSessionModel } from "./auth-session.model"

export const AuthSessionCollection = codeCollection(AuthSessionModel, {
	fields: {
		createdAt: {
			label: "Logged In At",
		},
		userId: { isForeignKey: true },
	},
	relations: {
		user: {
			label: "User",
			otherPropertyName: "authSessions",
			otherColumnName: "id",
			otherTableName: "zmaj_users",
			thisColumnName: "user_id",
			type: "many-to-one",
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
