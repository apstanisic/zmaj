import { DefineCollection } from "@common/collection-builder/define-collection"
import { zodCreate } from "@common/zod"
import { LayoutConfigSchema } from "../infra-collections/layout/layout-config.schema"
import { systemPermissions } from "../permissions"
import { FileInfo } from "./file.model"

export const FileCollection = DefineCollection<FileInfo>({
	tableName: "zmaj_files",
	options: {
		authzKey: systemPermissions.files.resource,
		displayTemplate: "{name}",
		label: "Files",
		layoutConfig: zodCreate(LayoutConfigSchema, {
			list: {
				layoutType: "gallery",
				quickFilter: true,
				defaultSort: { field: "createdAt", order: "DESC" },
				perPage: { default: 20, options: [10, 20, 50] },
				sortableFields: ["createdAt", "name", "id", "mimeType", "extension", "fileSize"],
				secondaryTemplate: "{extension}",
				tertiaryTemplate: "{fileSize|toKb} kb",
				size: "medium",
				// fieldsOrder: "",
			},
		}),
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false },
		description: { dataType: "long-text", columnName: "description" },
		folderPath: { dataType: "short-text", columnName: "folder_path" },
		mimeType: { dataType: "short-text", columnName: "mime_type", canUpdate: false },
		name: { dataType: "short-text", columnName: "name" },
		userId: { dataType: "uuid", columnName: "user_id", isForeignKey: true },
		fileSize: { dataType: "int", columnName: "file_size", canUpdate: false },
		storageProvider: { dataType: "short-text", columnName: "storage_provider", canUpdate: false },
		uri: { dataType: "short-text", columnName: "uri", canUpdate: false },
		extension: { dataType: "short-text", columnName: "extension", canUpdate: false },
	},
	relations: {
		user: {
			thisColumnName: "user_id",
			otherTableName: "zmaj_users",
			otherColumnName: "id",
			type: "many-to-one",
			otherPropertyName: "files",
		},
	},
})
