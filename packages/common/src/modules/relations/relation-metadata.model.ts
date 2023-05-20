import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { CollectionMetadataModel } from "../infra-collections/collection-metadata.model"

/**
 * Relation Metadata
 *
 * This is minimal info needed to construct relation
 */
// export type RelationMetadata = {
// 	/**
// 	 * Random ID (UUID)
// 	 */
// 	readonly id: string
// 	/**
// 	 * When was this relation created in app
// 	 */
// 	readonly createdAt: Date
// 	/**
// 	 * Foreign key name that this relation is tied to
// 	 */
// 	readonly fkName: string
// 	/**
// 	 * Table that this relation belongs to
// 	 */
// 	readonly tableName: string
// 	/**
// 	 * Property where joined data will be put
// 	 */
// 	propertyName: string
// 	/**
// 	 * Label for this relation
// 	 * Example: for posts => comments, label can be "Comments"
// 	 */
// 	label: string | null
// 	/**
// 	 * Template to display other side
// 	 */
// 	template: string | null
// 	/**
// 	 * If relation is many to many, this is second fk from junction table
// 	 */
// 	mtmFkName: string | null
// 	/**
// 	 * Should this relation be shown in UI
// 	 */
// 	hidden: boolean
// 	/**
// 	 * Collection this relation belongs to
// 	 */
// 	collection?: EntityRef<CollectionMetadata>
// }

export class RelationMetadataModel extends BaseModel {
	override name = "zmajRelationMetadata"
	override tableName = "zmaj_relation_metadata"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		tableName: f.text({ canUpdate: false }),
		fkName: f.text({ canUpdate: false }),
		propertyName: f.text({}),
		label: f.text({ nullable: true }),
		template: f.text({ nullable: true }),
		mtmFkName: f.text({ nullable: true }),
		hidden: f.boolean({ hasDefault: true }),
	}))
	collection = this.manyToOne(() => CollectionMetadataModel, {
		fkField: "tableName",
		referencedField: "tableName",
	})
}

export type RelationMetadata = ModelType<RelationMetadataModel>
