import { randBoolean } from "@ngneat/falso"
import { CollectionDef, LayoutConfigSchema, Stub, times } from "@zmaj-js/common"
import { camel } from "radash"
import { FieldDefStub } from "./field-def.stub.js"
import { RelationDefStub } from "./relation-def.stub.js"
import { CollectionMetadataStub } from "./collection-metadata.stub.js"

export const CollectionDefStub = Stub<CollectionDef>(() => {
	const base = CollectionMetadataStub()
	// const fields = times(8, () => FieldMetadataStub({ collectionId: base.id }))
	// const relations = times(3, () => RelationMetadataStub({ collectionId: base.id }))
	// const fields = Array.from(times(8, (i) => FieldMetadataStub({ tableName: base.tableName })))
	const fields = Array.from(
		times(8, (i) =>
			FieldDefStub({
				// collectionId: base.id,
				fieldName: "field" + i,
				columnName: "field_" + i,
			}),
		),
	)
	// const relations = Array.from(
	// 	times(3, (i) => RelationMetadataStub({ tableName: base.tableName, propertyName: "rel" + i })),
	// )
	const relations = Array.from(
		times(3, (i) =>
			RelationDefStub({
				tableName: base.tableName,
				collectionName: camel(base.tableName),
				propertyName: "rel" + i,
			}),
		),
	)

	// const properties = Object.fromEntries([
	// 	...fullRelations.map((r) => [r.propertyName, r]),
	// 	...fullFields.map((r) => [r.fieldName, r]),
	// ])
	const pkField = fields[0]!

	return {
		...base,
		// properties,
		// fullFields,
		// fullRelations,
		definedInCode: false,
		relations: Object.fromEntries(relations.map((r) => [r.propertyName, r])),
		fields: Object.fromEntries(fields.map((r) => [r.fieldName, r])),
		isJunctionTable: false, //random(1, 10) > 9,
		pkColumn: pkField.columnName,
		pkField: pkField.fieldName,
		pkType: randBoolean() ? "auto-increment" : "uuid",
		collectionName: camel(base.tableName),
		authzKey: `collections.${camel(base.tableName)}`,
		layoutConfig: LayoutConfigSchema.parse({}),
	}
})
