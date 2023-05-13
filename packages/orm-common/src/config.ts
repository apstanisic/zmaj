import { Except } from "type-fest"
import { ColumnType } from "./column-type"

export type ModelField = {
	fieldName: string
	dataType: ColumnType
	/** We will use field name if not provided */
	columnName?: string
	/** @default true */
	canRead?: boolean
	/** @default true */
	canUpdate?: boolean
	/** @default true */
	canCreate?: boolean
	/** @default false */
	isUnique?: boolean
	/** @default false */
	isNullable?: boolean
	/** @default false */
	isUpdatedAt?: boolean
	/** @default false */
	isCreatedAt?: boolean
	/** @default false */
	isAutoIncrement?: boolean
	/** @default false */
	isPrimaryKey?: boolean
	/** @default false */
	hasDefaultValue?: boolean
}

export type ModelConfig = {
	collectionName: string
	/** We will use collection name if not provided */
	tableName?: string
	disabled?: boolean
	fields: Record<string, ModelField> // | ColumnType>
	relations: Record<string, ModelRelation>
	// relations: Record<keyof OnlyRelations<T>, any>
}

export type DirectModel = {
	field: string
	referencedModel: string
	referencedField: string
	// otherColumnName: string
	// otherTableName: string
	otherPropertyName?: string
	type: "many-to-one" | "one-to-many" | "owner-one-to-one" | "ref-one-to-one"
}

export type M2M = Except<DirectModel, "type"> & {
	type: "many-to-many"
	junctionModel: string
	junctionField: string
	junctionReferencedField: string
}

export type ModelRelation = DirectModel | M2M
