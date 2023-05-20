import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { FieldMetadataModel } from "../infra-fields/field-metadata.model"
import { RelationMetadataModel } from "../relations"

// export type CollectionMetadata = {
// /**
//  * Collection Info ID
//  */
// readonly id: string

// /**
//  * Created At
//  */
// readonly createdAt: Date

// /**
//  * Table name
//  */
// readonly tableName: string

// /**
//  * Table name
//  */
// collectionName: string

// /**
//  * This collection will not be loaded by ORM, relation won't work
//  */
// disabled: boolean
// /**
//  * Pretty name
//  */
// label: string | null

// /**
//  * Hide from GUI
//  */
// hidden: boolean

// /**
//  * How to display collection item
//  * @example "${firstName} {lastName}"
//  */
// displayTemplate: string | null

// /**
//  * Fields relation
//  */
// fields?: readonly EntityRef<FieldMetadata>[]

// /**
//  * Fields relation
//  */
// relations?: EntityRef<RelationMetadata>[]

// /**
//  * I can only guarantee that it will be valid JSON. Validate first with LayoutConfigSchema
//  */
// // layoutConfig: JsonValue | LayoutConfig
// layoutConfig: unknown
// }

export class CollectionMetadataModel extends BaseModel {
	override name = "zmajCollectionMetadata"
	override tableName = "zmaj_collection_metadata"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		tableName: f.text({ canUpdate: false }),
		collectionName: f.text({}),
		disabled: f.boolean({ hasDefault: true }),
		label: f.text({ nullable: true }),
		hidden: f.boolean({ hasDefault: true }),
		displayTemplate: f.text({ nullable: true }),
		/**
		 * I can only guarantee that it will be valid JSON. Validate first with LayoutConfigSchema
		 */
		layoutConfig: f.json({}),
	}))
	colFields = this.oneToMany(() => FieldMetadataModel, {
		fkField: "tableName",
		referencedField: "tableName",
	})
	relations = this.oneToMany(() => RelationMetadataModel, {
		fkField: "tableName",
		referencedField: "tableName",
	})
}

export type CollectionMetadata = ModelType<CollectionMetadataModel>
