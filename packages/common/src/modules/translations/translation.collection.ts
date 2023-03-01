import { DefineCollection } from "@common/collection-builder/define-collection"
import { forbiddenKey } from "../permissions"
import { Translation } from "./translation.model"

export const TranslationCollection = DefineCollection<Translation>({
	tableName: "zmaj_translations",
	options: {
		authzKey: forbiddenKey,
	},
	fields: {
		id: { dataType: "uuid", isPrimaryKey: true, columnName: "id", canUpdate: false },
		createdAt: { dataType: "datetime", columnName: "created_at", canUpdate: false },
		collectionId: { dataType: "uuid", columnName: "collection_id", isForeignKey: true },
		translations: { dataType: "json", columnName: "translations" },
		itemId: { dataType: "short-text", columnName: "item_id" },
		language: { dataType: "short-text", columnName: "language" },
	},
	relations: {
		collection: {
			thisColumnName: "collection_id",
			otherColumnName: "id",
			otherTableName: "zmaj_collection_metadata",
			type: "many-to-one",
			otherPropertyName: "translations",
		},
	},
})
