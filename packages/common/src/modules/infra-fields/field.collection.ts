import { codeCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { FieldMetadataModel } from "./field-metadata.model"

export const FieldMetadataCollection = codeCollection(FieldMetadataModel, {
	options: {
		displayTemplate: 'Field "{fieldName}"',
		label: "Fields",
		authzKey: systemPermissions.infra.resource,
	},
	fields: {
		tableName: {
			isForeignKey: true,
		},
	},
	relations: {
		collection: {
			type: "many-to-one",
			otherPropertyName: "colFields",
			otherTableName: "zmaj_collection_metadata",
			thisColumnName: "tableName",
			otherColumnName: "tableName",
		},
	},
})
