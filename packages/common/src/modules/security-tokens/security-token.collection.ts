import { codeCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { SecurityTokenModel } from "./security-token.model"

export const SecurityTokenCollection = codeCollection(SecurityTokenModel, {
	options: { authzKey: forbiddenKey },
	fields: {
		userId: { isForeignKey: true }, // security token can't change owner
	},
	relations: {
		user: {
			otherPropertyName: "tokens",
			otherColumnName: "id",
			otherTableName: "zmaj_users",
			thisColumnName: "userId",
			type: "many-to-one",
		},
	},
})
