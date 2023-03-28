import { randBoolean } from "@ngneat/falso"
import { CollectionDef, LayoutConfigSchema, Stub, times } from "@zmaj-js/common"
import { CollectionMetadataStub } from "./collection-metadata.stub.js"
import { FieldDefStub } from "./field-def.stub.js"
import { RelationDefStub } from "./relation-def.stub.js"

export const CollectionDefStub = Stub<CollectionDef>(() => {
	const base = CollectionMetadataStub()
	const fields = times(8, (i) =>
		FieldDefStub({
			// collectionId: base.id,
			fieldName: "field" + i,
			columnName: "field_" + i,
			tableName: base.tableName,
			collectionName: base.collectionName,
			isPrimaryKey: false,
		}),
	)
	// const relations = Array.from(
	// 	times(3, (i) => RelationMetadataStub({ tableName: base.tableName, propertyName: "rel" + i })),
	// )
	const relations = Array.from(
		times(3, (i) =>
			RelationDefStub({
				tableName: base.tableName,
				collectionName: base.collectionName,
				propertyName: "rel" + i,
			}),
		),
	)

	const pkField = fields[0]!
	pkField.isPrimaryKey = true

	return {
		...base,
		definedInCode: false,
		relations: Object.fromEntries(relations.map((r) => [r.propertyName, r])),
		fields: Object.fromEntries(fields.map((r) => [r.fieldName, r])),
		isJunctionTable: false, //random(1, 10) > 9,
		pkColumn: pkField.columnName,
		pkField: pkField.fieldName,
		pkType: randBoolean() ? "auto-increment" : "uuid",
		authzKey: `collections.${base.collectionName}`,
		layoutConfig: LayoutConfigSchema.parse({}),
	}
})
