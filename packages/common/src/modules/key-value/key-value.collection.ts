import { codeCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { KeyValueModel } from "./key-value.model"

export const KeyValueCollection = codeCollection(KeyValueModel, {
	options: {
		authzKey: forbiddenKey,
	},
	relations: {},
})
