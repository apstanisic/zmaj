import { defineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { SecurityTokenModel } from "./security-token.model"

export const SecurityTokenCollection = defineCollection(SecurityTokenModel, {
	tableName: "zmaj_security_tokens",
	options: { authzKey: forbiddenKey },
	fields: {
		userId: { canUpdate: false, isForeignKey: true }, // security token can't change owner
	},
	relations: {
		user: {
			// thisColumnName: "user_id",
			// otherColumnName: "id",
			// otherTableName: "zmaj_users",
			// type: "many-to-one",
			otherPropertyName: "tokens",
		},
	},
})
