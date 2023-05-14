import { defineCollection } from "@common/collection-builder/define-collection"
import { systemPermissions } from "../permissions"
import { CollectionMetadataModel } from "./collection-metadata.model"

export const CollectionMetadataCollection = defineCollection(CollectionMetadataModel, {
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
})
