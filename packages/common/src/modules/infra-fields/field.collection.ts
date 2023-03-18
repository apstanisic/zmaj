import { DefineCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { FieldMetadata } from "./field-metadata.model"

export const FieldMetadataCollection = DefineCollection<FieldMetadata>({
	tableName: "zmaj_field_metadata",
	options: {
		displayTemplate: 'Field "{columnName|camelCase}"',
		label: "Fields",
		authzKey: systemPermissions.infra.resource,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
			canCreate: false,
		},
		columnName: { dataType: "short-text", canUpdate: false, columnName: "column_name" },
		tableName: {
			dataType: "short-text",
			canUpdate: false,
			columnName: "table_name",
			isForeignKey: true,
		},
		componentName: { dataType: "short-text", columnName: "component_name" },
		label: { dataType: "short-text", columnName: "label" },
		displayTemplate: { dataType: "short-text", columnName: "display_template" },
		canUpdate: { dataType: "boolean", columnName: "can_update" },
		canCreate: { dataType: "boolean", columnName: "can_create" },
		canRead: { dataType: "boolean", columnName: "can_read" },
		description: { dataType: "long-text", columnName: "description" },
		fieldConfig: { dataType: "json", columnName: "field_config" },
		// width: { dataType: "int", columnName: "width" },
		isCreatedAt: { dataType: "boolean", columnName: "is_created_at" },
		isUpdatedAt: { dataType: "boolean", columnName: "is_updated_at" },
		sortable: { dataType: "boolean", columnName: "sortable" },
	},
	relations: {
		collection: {
			thisColumnName: "table_name",
			otherColumnName: "table_name",
			otherTableName: "zmaj_collection_metadata",
			type: "many-to-one",
			otherPropertyName: "fields",
		},
	},
})
