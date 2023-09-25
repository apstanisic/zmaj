import { codeCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { ActivityLog, ActivityLogModel } from "./activity-log.model"

/**
 * ActivityLog entity
 * Most of the column can not be updated, since that would harm log integrity
 */
export const ActivityLogCollection = codeCollection(ActivityLogModel, {
	options: {
		authzKey: systemPermissions.activityLog.resource,
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				hideDelete: true,
				defaultSort: { field: "createdAt", order: "DESC" },
				filterableFields: [
					"id",
					"action",
					"createdAt",
					"ip",
					"resource",
					"userId",
					"userAgent",
				] satisfies (keyof ActivityLog)[],
				disableFilter: true,
			},
		}),
	},
	fields: {
		userId: { isForeignKey: true },
	},
	relations: {
		user: {
			otherPropertyName: "activityLogs",
			type: "many-to-one",
			otherColumnName: "id",
			otherTableName: "zmaj_users",
			thisColumnName: "user_id",
		},
	},
})
