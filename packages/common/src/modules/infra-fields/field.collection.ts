import { defineCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { FieldMetadataModel } from "./field-metadata.model"

export const FieldMetadataCollection = defineCollection(FieldMetadataModel, {
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
})
