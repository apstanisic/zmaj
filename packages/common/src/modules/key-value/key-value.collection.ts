import { DefineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { KeyValue } from "./key-value.model"

export const KeyValueCollection = DefineCollection<KeyValue>({
	tableName: "zmaj_key_value",
	options: {
		authzKey: forbiddenKey,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false },
		key: { dataType: "short-text", columnName: "key", canUpdate: false },
		value: { dataType: "long-text", columnName: "value" },
		// description: { dataType: "long-text", columnName: "description" },
		updatedAt: { dataType: "datetime", columnName: "updated_at" },
		namespace: { dataType: "short-text", columnName: "namespace", canUpdate: false },
	},
	relations: {},
})
