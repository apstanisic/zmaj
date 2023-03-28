import { rand, randColor, randDatabaseColumn } from "@ngneat/falso"
import { CollectionDef, LayoutConfigSchema, RelationDef, stub, times } from "@zmaj-js/common"
import { camel, pick } from "radash"
import { CollectionMetadataStub } from "./collection-metadata.stub.js"
import { FieldDefStub } from "./field-def.stub.js"
import { RelationDefStub } from "./relation-def.stub.js"

export const CollectionDefStub = stub<CollectionDef>((modify) => {
	const base = CollectionMetadataStub(
		pick(modify, [
			"collectionName",
			"createdAt",
			"displayTemplate",
			"disabled",
			"label",
			"hidden",
			"id",
			"label",
			"layoutConfig",
			"tableName",
		]),
	)
	const fields = times(8, (i) => {
		const columnName = randDatabaseColumn() + "_" + (i + 1)
		return FieldDefStub({
			fieldName: camel(columnName),
			columnName,
			tableName: base.tableName,
			collectionName: base.collectionName,
			isPrimaryKey: false,
		})
	})

	const pkType = modify.pkType ?? rand(["auto-increment", "uuid"])

	const pkField = fields[0]!
	pkField.dataType = pkType === "auto-increment" ? "int" : "uuid"
	pkField.dbRawDataType = pkField.dataType === "int" ? "serial4" : "uuid"
	pkField.isPrimaryKey = true
	pkField.isUnique = true

	// const relations = Array.from(
	// 	times(3, (i) => RelationMetadataStub({ tableName: base.tableName, propertyName: "rel" + i })),
	// )
	const relations = Array.from(
		times(3, (i) => {
			const type: RelationDef["type"] = rand([
				"many-to-one",
				"one-to-many",
				"ref-one-to-one",
				"owner-one-to-one",
				"many-to-many",
			])
			// if fk here, any field not pk, otherwise pk
			const field =
				type === "many-to-one" || type === "owner-one-to-one" ? rand(fields.slice(1)) : fields[0]!
			return RelationDefStub({
				tableName: base.tableName,
				collectionName: base.collectionName,
				propertyName: randColor() + (i + 1),
				columnName: field.columnName,
				fieldName: field.fieldName,
				type,
			})
		}),
	)

	return {
		...base,
		definedInCode: false,
		relations: Object.fromEntries(relations.map((r) => [r.propertyName, r])),
		fields: Object.fromEntries(fields.map((r) => [r.fieldName, r])),
		isJunctionTable: false, //random(1, 10) > 9,
		pkColumn: pkField.columnName,
		pkField: pkField.fieldName,
		pkType: pkType,
		authzKey: `collections.${base.collectionName}`,
		layoutConfig: LayoutConfigSchema.parse({}),
	}
})
