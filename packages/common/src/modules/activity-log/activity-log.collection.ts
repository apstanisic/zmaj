import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { ActivityLog } from "./activity-log.model"

/**
 * ActivityLog entity
 * Most of the column can not be updated, since that would harm log integrity
 */
export const ActivityLogCollection = DefineCollection<ActivityLog>({
	tableName: "zmaj_activity_log",
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
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
		},
		ip: { dataType: "short-text", columnName: "ip", canUpdate: false },
		userAgent: { dataType: "short-text", columnName: "user_agent", canUpdate: false },
		action: { dataType: "short-text", columnName: "action", canUpdate: false },
		comment: { dataType: "short-text", columnName: "comment" },
		resource: { dataType: "short-text", columnName: "resource", canUpdate: false },
		itemId: { dataType: "short-text", columnName: "item_id", canUpdate: false },
		userId: { dataType: "uuid", columnName: "user_id", canUpdate: false, isForeignKey: true },
		changes: { dataType: "json", columnName: "changes", canUpdate: false },
		previousData: { dataType: "json", columnName: "previous_data", canUpdate: false },
		additionalInfo: { dataType: "json", columnName: "additional_info" },
		embeddedUserInfo: { dataType: "json", columnName: "embedded_user_info", canUpdate: false },
	},
	relations: {
		user: {
			thisColumnName: "user_id",
			// leftTable: "zmaj_activity_log",
			otherTableName: "zmaj_users",
			otherColumnName: "id",
			type: "many-to-one",
			otherPropertyName: "activityLogs",
		},
	},
})
