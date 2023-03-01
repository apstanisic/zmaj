import { DefineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { SecurityToken } from "./security-token.model"

export const SecurityTokenCollection = DefineCollection<SecurityToken>({
	tableName: "zmaj_security_tokens",
	options: {
		authzKey: forbiddenKey,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false },
		token: { dataType: "short-text", columnName: "token", canUpdate: false }, // We can't change token
		usedFor: { dataType: "short-text", columnName: "used_for", canUpdate: false }, // we can't change reason after creating
		data: { dataType: "short-text", columnName: "data", canUpdate: false },
		// We can't update duration. Create new token in that case
		validUntil: { dataType: "datetime", columnName: "valid_until", canUpdate: false },
		userId: { dataType: "uuid", columnName: "user_id", canUpdate: false, isForeignKey: true }, // security token can't change owner
	},
	relations: {
		user: {
			thisColumnName: "user_id",
			otherColumnName: "id",
			otherTableName: "zmaj_users",
			type: "many-to-one",
			otherPropertyName: "tokens",
		},
	},
})
