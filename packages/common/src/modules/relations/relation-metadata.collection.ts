import { codeCollection } from "@common/collection-builder"
import { systemPermissions } from "../permissions"
import { RelationMetadataModel } from "./relation-metadata.model"

export const RelationMetadataCollection = codeCollection(RelationMetadataModel, {
	options: {
		displayTemplate: 'Relation "{leftTable}.{propertyName}"',
		label: "Relations",
		authzKey: systemPermissions.infra.resource,
	},
	relations: {
		collection: {
			type: "many-to-one",
			otherColumnName: "tableName",
			otherPropertyName: "relations",
			otherTableName: "zmaj_collection_metadata",
			thisColumnName: "tableName",
		},
	},
})
