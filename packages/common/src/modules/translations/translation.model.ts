import { Struct } from "@common/types"
import { EntityRef } from "../crud-types/entity-ref.type"
import { CollectionMetadata } from "../infra-collections/collection-metadata.model"

export type Translation = {
	/**
	 * Translation ID
	 */
	id: string
	/**
	 * When was created
	 */
	createdAt: Date
	/**
	 * Language of a translation
	 */
	language: string
	/**
	 * Collection ID that this translations contains
	 */
	collectionId: string
	/**
	 * Item ID that this translations contains
	 */
	itemId: string
	/**
	 * Translation values (key is column name, value is translation)
	 * Value can only be string cause there is no need to translate number/dates
	 */
	translations: Struct<string>

	/**
	 * Collection Info that this translation belongs to
	 */
	collection?: EntityRef<CollectionMetadata>
}
