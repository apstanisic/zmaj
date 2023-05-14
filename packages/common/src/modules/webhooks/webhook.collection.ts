import { defineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { WebhookModel } from "./webhook.model"

export const WebhookCollection = defineCollection(WebhookModel, {
	options: {
		authzKey: systemPermissions.webhooks.resource,
		displayTemplate: "{name}",
		label: "Webhooks",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				layout: {
					table: { fields: ["email", "roleId", "status", "firstName", "lastName"] },
				},
				defaultSort: { field: "createdAt", order: "DESC" },
			},
		}),
	},
	fields: {
		url: { componentName: "url" },
		// was array
		events: { dbRawDataType: "character varying[]" },
		httpHeaders: {
			componentName: "key-value",
		},
	},
})
