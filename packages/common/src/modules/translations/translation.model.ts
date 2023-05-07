import { BaseModel, ModelType } from "@zmaj-js/orm-common"

class TranslationModel extends BaseModel {
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
		collectionId: f.uuid({}),
		/**
		 * Item ID that this translations contains
		 */
		itemId: f.text({}),
		/**
		 * Translation values (key is column name, value is translation)
		 * Value can only be string cause there is no need to translate number/dates
		 */
		translations: f.json({}),
	}))
	// TODO Add collection relation
}

export type Translation = ModelType<TranslationModel>
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
