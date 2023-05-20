import { defineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { SecurityTokenModel } from "./security-token.model"

export const SecurityTokenCollection = defineCollection(SecurityTokenModel, {
	options: { authzKey: forbiddenKey },
	fields: {
		userId: { isForeignKey: true }, // security token can't change owner
	},
	relations: {
		user: {
			otherPropertyName: "tokens",
		},
	},
})
