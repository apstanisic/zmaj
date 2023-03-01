import { Except } from "type-fest"
import { ColumnDataType } from "./column-data-type.schema"
import { FieldConfig } from "./field-config.type"
import { FieldMetadata } from "./field-metadata.model"

/**
 * Definition for single field
 */
export type FieldDef = Except<FieldMetadata, "fieldConfig"> & {
	/**
	 * Here we can guarantee that this is valid field config, since we parsed it
	 */
	fieldConfig: FieldConfig
	/**
	 * Camel cased table name
	 */
	collectionName: string
	/**
	 * Camel cased column name
	 */
	fieldName: string
	/**
	 * is field primary key
	 */
	isPrimaryKey: boolean
	/**
	 * is field unique in database
	 */
	isUnique: boolean
	/**
	 * is field's column foreign key
	 */
	isForeignKey: boolean
	/**
	 * Is db field nullable
	 */
	isNullable: boolean
	/**
	 * is field auto increment
	 */
	isAutoIncrement: boolean
	/**
	 * Does this field have default value
	 */
	hasDefaultValue: boolean
	/**
	 * Data type that is stored in db, transformed to some common types
	 */
	dataType: ColumnDataType
	/**
	 * Always string if exists
	 */
	dbDefaultValue: string | null
	/**
	 * Data type that is stored in db. Raw, not parsed value
	 */
	dbRawDataType: string
}
