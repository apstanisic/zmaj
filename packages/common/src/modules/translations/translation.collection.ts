import { defineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { TranslationModel } from "./translation.model"

export const TranslationCollection = defineCollection(TranslationModel, {
	options: {
		authzKey: forbiddenKey,
	},
	fields: {
		collectionId: { isForeignKey: true },
	},
})
