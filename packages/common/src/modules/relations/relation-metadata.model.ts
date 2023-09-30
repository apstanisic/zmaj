import { BaseModel, GetModelFields } from "@zmaj-js/orm"
import { CollectionMetadataModel } from "../infra-collections/collection-metadata.model"

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

export type RelationMetadata = GetModelFields<RelationMetadataModel>
