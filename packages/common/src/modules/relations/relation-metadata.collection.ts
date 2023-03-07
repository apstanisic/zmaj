import { DefineCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { RelationMetadata } from "./relation-metadata.model"

export const RelationMetadataCollection = DefineCollection<RelationMetadata>({
	tableName: "zmaj_relation_metadata",
	options: {
		displayTemplate: 'Relation "{leftTable}.{propertyName}"',
		label: "Relations",
		authzKey: systemPermissions.infra.resource,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false },
		fkName: { dataType: "short-text", canUpdate: false },
		label: { dataType: "short-text" },
		hidden: { dataType: "boolean" },
		mtmFkName: { dataType: "short-text" },
		tableName: { dataType: "short-text" },
		propertyName: { dataType: "short-text" },
		template: { dataType: "short-text" },
	},
	relations: {
		collection: {
			type: "many-to-one",
			thisColumnName: "table_name",
			otherColumnName: "table_name",
			otherTableName: "zmaj_collection_metadata",
			otherPropertyName: "relations",
		},
	},
})
