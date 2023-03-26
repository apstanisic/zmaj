import { Except } from "type-fest"
import { Struct } from "../../types/struct.type"
import { FieldDef } from "../infra-fields/field-def.type"
import { RelationDef } from "../relations/relation-def.type"
import { CollectionMetadata } from "./collection-metadata.model"
import { LayoutConfig } from "./layout/layout-config.type"

/**
 * we are keeping `T`, so we can access type info about collection
 */
// export type CollectionDef<
// 	T extends Struct = Struct,
// 	PK extends keyof T & string = any, //keyof T & string,
// > = CollectionMetadata & {
// 	/**
// 	 * Collection name (camel cased table: super_users => superUsers)
// 	 */
// 	collectionName: string
// 	/**
// 	 * Key for checking authorization
// 	 */
// 	authzKey: string
// 	/**
// 	 * Type of primary key (maybe add in the future custom)
// 	 */
// 	pkType: "uuid" | "auto-increment"
// 	/**
// 	 * Primary key column
// 	 */
// 	// pkColumn: string
// 	pkColumn: SnakeCase<PK>
// 	/**
// 	 * Primary key field
// 	 */
// 	// pkField: string
// 	pkField: PK
// 	/**
// 	 * Is this table junction table for other relations
// 	 */
// 	isJunctionTable: boolean
// 	/**
// 	 * Is this collection defined with code.
// 	 * User should be able to provide definition with code, or from db
// 	 */
// 	definedInCode: boolean
// 	/**
// 	 * All fields in this collection, expanded.
// 	 */
// 	fullFields: readonly FieldDef[]
// 	/**
// 	 * All relations in this collection, expanded.
// 	 */
// 	fullRelations: readonly RelationDef[]
// 	/**
// 	 * All properties that are found in model
// 	 * Key is property name, value is either relation or field
// 	 */
// 	properties: Struct<FieldDef | RelationDef>
// }

export type CollectionDef<T extends Struct = Struct> = Except<
	CollectionMetadata,
	"fields" | "relations" | "layoutConfig"
> & {
	/**
	 * Collection name (camel cased table: super_users => superUsers)
	 */
	// collectionName: string
	/**
	 * Key for checking authorization
	 */
	authzKey: string
	/**
	 * Type of primary key (maybe add in the future custom)
	 */
	pkType: "uuid" | "auto-increment"
	/**
	 * Primary key column
	 */
	// pkColumn: string
	pkColumn: string
	/**
	 * Primary key field
	 */
	// pkField: string
	pkField: string
	/**
	 * Is this table junction table for other relations
	 */
	isJunctionTable: boolean
	/**
	 * Is this collection defined with code.
	 * User should be able to provide definition with code, or from db
	 */
	definedInCode: boolean

	fields: Struct<FieldDef>

	// relations: Struct<RelationDef>
	relations: Struct<RelationDef>

	layoutConfig: LayoutConfig

	__$type?: T
}

// export type CollectionDef<T extends Struct = Struct> = CollectionDef<T>
