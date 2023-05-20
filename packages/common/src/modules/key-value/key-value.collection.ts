import { defineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { KeyValueModel } from "./key-value.model"

export const KeyValueCollection = defineCollection(KeyValueModel, {
	options: {
		authzKey: forbiddenKey,
	},
})
