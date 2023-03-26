import { EntityRef } from "../crud-types/entity-ref.type"
import { CollectionMetadata } from "../infra-collections/collection-metadata.model"

/**
 * Relation Metadata
 *
 * This is minimal info needed to construct relation
 */
export type RelationMetadata = {
	/**
	 * Random ID (UUID)
	 */
	readonly id: string
	/**
	 * When was this relation created in app
	 */
	readonly createdAt: Date
	/**
	 * Foreign key name that this relation is tied to
	 */
	readonly fkName: string
	/**
	 * Table that this relation belongs to
	 */
	readonly tableName: string
	/**
	 * Property where joined data will be put
	 */
	propertyName: string
	/**
	 * Label for this relation
	 * Example: for posts => comments, label can be "Comments"
	 */
	label: string | null
	/**
	 * Template to display other side
	 */
	template: string | null
	/**
	 * If relation is many to many, this is second fk from junction table
	 */
	mtmFkName: string | null
	/**
	 * Should this relation be shown in UI
	 */
	hidden: boolean
	/**
	 * Collection this relation belongs to
	 */
	collection?: EntityRef<CollectionMetadata>
}
