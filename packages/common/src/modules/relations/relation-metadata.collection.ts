import { defineCollection } from "@common/collection-builder"
import { systemPermissions } from "../permissions"
import { RelationMetadataModel } from "./relation-metadata.model"

export const RelationMetadataCollection = defineCollection(RelationMetadataModel, {
	options: {
		displayTemplate: 'Relation "{leftTable}.{propertyName}"',
		label: "Relations",
		authzKey: systemPermissions.infra.resource,
	},
})
