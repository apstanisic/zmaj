import { EntityRef } from "@zmaj-js/orm-common"
import { FieldMetadata } from "../infra-fields/field-metadata.model"
import { RelationMetadata } from "../relations"

export type CollectionMetadata = {
	/**
	 * Collection Info ID
	 */
	readonly id: string

	/**
	 * Created At
	 */
	readonly createdAt: Date

	/**
	 * Table name
	 */
	readonly tableName: string

	/**
	 * Table name
	 */
	collectionName: string

	/**
	 * This collection will not be loaded by ORM, relation won't work
	 */
	disabled: boolean
	/**
	 * Pretty name
	 */
	label: string | null

	/**
	 * Hide from GUI
	 */
	hidden: boolean

	/**
	 * How to display collection item
	 * @example "${firstName} {lastName}"
	 */
	displayTemplate: string | null

	/**
	 * Fields relation
	 */
	fields?: readonly EntityRef<FieldMetadata>[]

	/**
	 * Fields relation
	 */
	relations?: EntityRef<RelationMetadata>[]

	/**
	 * I can only guarantee that it will be valid JSON. Validate first with LayoutConfigSchema
	 */
	// layoutConfig: JsonValue | LayoutConfig
	layoutConfig: unknown
}
