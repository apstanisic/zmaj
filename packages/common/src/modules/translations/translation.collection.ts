import { codeCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { TranslationModel } from "./translation.model"

export const TranslationCollection = codeCollection(TranslationModel, {
	options: {
		authzKey: forbiddenKey,
	},
	fields: {
		collectionId: { isForeignKey: true },
	},
	relations: {
		collection: {
			otherColumnName: "id",
			otherTableName: "zmaj_collection_metadata",
			thisColumnName: "collection_id",
			type: "many-to-one",
			otherPropertyName: "translations",
		},
	},
})
