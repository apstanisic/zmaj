import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { Webhook } from "./webhook.model"

export const WebhookCollection = DefineCollection<Webhook>({
	tableName: "zmaj_webhooks",
	options: {
		authzKey: systemPermissions.webhooks.resource,
		displayTemplate: "{name}",
		label: "Webhooks",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				fieldsOrder: ["name", "enabled", "url", "httpMethod"],
				defaultSort: { field: "createdAt", order: "DESC" },
				secondaryTemplate: "{url}",
			},
		}),
	},

	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		httpMethod: { dataType: "short-text", columnName: "http_method", isNullable: false },
		name: { dataType: "short-text", columnName: "name", isNullable: false },
		description: { dataType: "short-text", columnName: "description", isNullable: true },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			// createDate: true,
			canUpdate: false,
		},
		enabled: { dataType: "boolean", columnName: "enabled", isNullable: false },
		url: { dataType: "short-text", columnName: "url", componentName: "url", isNullable: false },
		// was array
		events: { dataType: "array", columnName: "events", dbRawDataType: "character varying[]" },
		httpHeaders: {
			dataType: "json",
			columnName: "http_headers",
			componentName: "key-value",
		},
		sendData: { dataType: "boolean", columnName: "send_data", isNullable: false },
	},
	relations: {},
})
