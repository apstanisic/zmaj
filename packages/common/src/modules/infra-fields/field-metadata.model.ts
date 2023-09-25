import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { CollectionMetadataModel } from "../infra-collections/collection-metadata.model"

export class FieldMetadataModel extends BaseModel {
	override name = "zmajFieldMetadata"
	override tableName = "zmaj_field_metadata"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		tableName: f.text({ canUpdate: false }),
		columnName: f.text({ canUpdate: false }),
		fieldName: f.text({}),
		componentName: f.text({ nullable: true }),
		sortable: f.boolean({ hasDefault: true }),
		canRead: f.boolean({ hasDefault: true }),
		canUpdate: f.boolean({ hasDefault: true }),
		canCreate: f.boolean({ hasDefault: true }),
		isCreatedAt: f.boolean({ hasDefault: true }),
		isUpdatedAt: f.boolean({ hasDefault: true }),
		label: f.text({ nullable: true }),
		displayTemplate: f.text({ nullable: true }),
		description: f.text({ nullable: true }),
		fieldConfig: f.json({}),
	}))
	collection = this.manyToOne(() => CollectionMetadataModel, {
		fkField: "tableName",
		referencedField: "tableName",
	})
}

export type FieldMetadata = GetModelFields<FieldMetadataModel>
