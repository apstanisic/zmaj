import { DefineCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { CollectionMetadata } from "./infra-collection.model"

export const CollectionMetadataCollection = DefineCollection<CollectionMetadata>({
	tableName: "zmaj_collection_metadata",
	options: {
		authzKey: systemPermissions.infra.resource,
		label: "Collections",
		displayTemplate: "{tableName}",
		layoutConfig: {
			list: {
				// todo enable pagination. Currently all columns are returned
				hidePagination: true,
				quickFilter: false,
				perPage: { default: 20, options: [20] },
				defaultSort: { field: "createdAt", order: "DESC" },
				disableFilter: true,
				disableMultiSelect: true,
				primaryTemplate: "{tableName}",
				secondaryTemplate: "{description}",
			},
		},
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		tableName: { dataType: "short-text", columnName: "table_name", canUpdate: false },
		createdAt: {
			dataType: "datetime",
			columnName: "created_at",
			canUpdate: false,
			canCreate: false,
		},
		// description: { dataType: "long-text", columnName: "description" },
		hidden: { dataType: "boolean", columnName: "hidden" },
		disabled: { dataType: "boolean", columnName: "disabled" },
		// createdAtFieldId: { dataType: "uuid", columnName: "created_at_field_id" },
		// updatedAtFieldId: { dataType: "uuid", columnName: "updated_at_field_id" },
		// validation: { dataType: "json", columnName: "validation" },
		// icon: { dataType: "short-text", columnName: "icon" },
		label: { dataType: "short-text", columnName: "label" },
		// fieldsOrder: { dataType: "json", columnName: "fields_order" }, //array
		displayTemplate: { dataType: "short-text", columnName: "display_template" },
		layoutConfig: { dataType: "json", columnName: "layout_config" },
	},
	relations: {
		relations: {
			type: "one-to-many",
			thisColumnName: "table_name",
			otherColumnName: "table_name",
			otherTableName: "zmaj_relation_metadata",
			otherPropertyName: "collection",
		},
		fields: {
			type: "one-to-many",
			thisColumnName: "table_name",
			otherColumnName: "table_name",
			otherTableName: "zmaj_field_metadata",
			otherPropertyName: "collection",
		},
	},
})
