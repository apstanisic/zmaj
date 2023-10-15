import { Except } from "type-fest"
import { Struct } from "../../types/struct.type"
import { FieldDef } from "../infra-fields/field-def.type"
import { RelationDef } from "../relations/relation-def.type"
import { CollectionMetadata } from "./collection-metadata.model"
import { LayoutConfig } from "./layout/layout-config.type"

export type CollectionDef = Except<
	CollectionMetadata,
	"layoutConfig"
	// "colFields" | "relations" | "layoutConfig"
> & {
	/**
	 * Key for checking authorization
	 */
	authzKey: string

	/**
	 * User must have manage permission to use this
	 */
	authzMustManage: boolean
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
}
