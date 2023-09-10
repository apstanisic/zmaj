import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { CollectionMetadataModel } from "../infra-collections"

export class TranslationModel extends BaseModel {
	override name = "zmajTranslations"
	override tableName = "zmaj_translations"
	override fields = this.buildFields((f) => ({
		/**
		 * Translation ID
		 */
		id: f.uuid({ isPk: true }),
		/**
		 * When was created
		 */
		createdAt: f.createdAt({}),
		/**
		 * Language of a translation
		 */
		language: f.text({}),
		/**
		 * Collection ID that this translations contains
		 */
		collectionId: f.uuid({ columnName: "collection_id" }),
		/**
		 * Item ID that this translations contains
		 */
		itemId: f.text({ columnName: "item_id" }),
		/**
		 * Translation values (key is column name, value is translation)
		 * Value can only be string cause there is no need to translate number/dates
		 */
		translations: f.json({}),
	}))
	// TODO Add collection relation
	collection = this.manyToOne(() => CollectionMetadataModel, { fkField: "collectionId" })
}

export type Translation = GetModelFields<TranslationModel>
// export type Translation = {
// 	/**
// 	 * Translation ID
// 	 */
// 	id: string
// 	/**
// 	 * When was created
// 	 */
// 	createdAt: Date
// 	/**
// 	 * Language of a translation
// 	 */
// 	language: string
// 	/**
// 	 * Collection ID that this translations contains
// 	 */
// 	collectionId: string
// 	/**
// 	 * Item ID that this translations contains
// 	 */
// 	itemId: string
// 	/**
// 	 * Translation values (key is column name, value is translation)
// 	 * Value can only be string cause there is no need to translate number/dates
// 	 */
// 	translations: Struct<string>

// 	/**
// 	 * Collection Info that this translation belongs to
// 	 */
// 	collection?: EntityRef<CollectionMetadata>
// }
