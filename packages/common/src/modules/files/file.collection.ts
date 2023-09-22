import { codeCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { FileModel } from "./file.model"

export const FileCollection = codeCollection(FileModel, {
	options: {
		authzKey: systemPermissions.files.resource,
		displayTemplate: "{name}",
		label: "Files",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				layout: {
					gallery: {
						secondaryTemplate: "{name|extension}",
						tertiaryTemplate: "{fileSize|toKb} kb",
					},
				},
				layoutType: "gallery",
				quickFilter: true,
				defaultSort: { field: "createdAt", order: "DESC" },
				perPage: { default: 20, options: [10, 20, 50] },
				sortableFields: ["createdAt", "name", "id", "mimeType", "fileSize"],
				size: "medium",
			},
		}),
	},
	fields: {},
	relations: {
		user: {
			otherPropertyName: "files",
			type: "many-to-one",
			otherColumnName: "id",
			otherTableName: "zmaj_users",
			thisColumnName: "user_id",
		},
	},
})
