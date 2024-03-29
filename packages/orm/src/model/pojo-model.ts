import { Except } from "type-fest"
import { ColumnDataType } from "./fields/column-data-type"

export type PojoModelField = {
	/* This is the same as key in fields object */
	fieldName: string
	dataType: ColumnDataType
	/** We will use field name if not provided */
	columnName: string
	/** @default true */
	canRead: boolean
	/** @default true */
	canUpdate: boolean
	/** @default true */
	canCreate: boolean
	/** @default false */
	isUnique: boolean
	/** @default false */
	isNullable: boolean
	/** @default false */
	isUpdatedAt: boolean
	/** @default false */
	isCreatedAt: boolean
	/** @default false */
	isAutoIncrement: boolean
	/** @default false */
	isPrimaryKey: boolean
	/** @default false */
	hasDefaultValue: boolean
}

export type PojoModelDirectRelation = {
	field: string
	referencedModel: string
	referencedField: string
	// otherColumnName: string
	// otherTableName: string
	otherPropertyName?: string
	type: "many-to-one" | "one-to-many" | "owner-one-to-one" | "ref-one-to-one"
}

export type PojoModelJunctionRelation = Except<PojoModelDirectRelation, "type"> & {
	type: "many-to-many"
	junctionModel: string
	junctionField: string
	junctionReferencedField: string
}

export type PojoModelRelation = PojoModelDirectRelation | PojoModelJunctionRelation

export type PojoModel = {
	name: string
	/** We will use name as tableName if tableName is undefined **/
	tableName: string
	disabled: boolean
	idField: string
	updatedAtField: string | null
	createdAtField: string | null
	fields: Record<string, PojoModelField>
	relations: Record<string, PojoModelRelation>
	isPojoModel: true
}
