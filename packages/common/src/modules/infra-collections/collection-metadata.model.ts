import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { FieldMetadataModel } from "../infra-fields/field-metadata.model"
import { RelationMetadataModel } from "../relations"

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
		layoutConfig: f.json({ hasDefault: true }),
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

export type CollectionMetadata = GetModelFields<CollectionMetadataModel>
