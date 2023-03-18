import { EntityRef } from "../crud-types/entity-ref.type"
import { CollectionMetadata } from "../infra-collections/infra-collection.model"

export type FieldMetadata = {
	/**
	 * Field info ID
	 */
	readonly id: string

	/**
	 * Created At
	 */
	readonly createdAt: Date

	/**
	 * Field name in database
	 * Every field has one to one mapping to database column
	 */
	readonly columnName: string

	/**
	 * Table name
	 */
	readonly tableName: string

	/**
	 * Can value be updated. Useful for readonly values
	 */
	canUpdate: boolean

	/**
	 * Can user provide value when creating. If not, it will use db default value
	 */
	canCreate: boolean

	/**
	 * Can this value be read. If false it will hide value on ORM level
	 */
	canRead: boolean

	/**
	 * Can we sort by this field
	 */
	sortable: boolean

	/**
	 * This is used only for showing property name in GUI, nowhere in the API is used
	 * If not provided, label will be generated from column name
	 */
	label: string | null

	/**
	 * Can be used by component to transform data
	 */
	displayTemplate: string | null

	/**
	 * Description for admin panel users to explain what to type
	 * Defaults to empty string
	 * It's used as helper text on inputs, or as a tooltip
	 */
	description: string | null

	/**
	 * Used for deciding what component to render for field
	 */
	componentName: string | null

	/**
	 * Is this field auto timestamp for created at time
	 */
	isCreatedAt: boolean

	/**
	 * Is this field auto timestamp for updated at time
	 */
	isUpdatedAt: boolean
	/**
	 * Value is JSON, which means it can be string, number... I can't guarantee anything
	 */
	fieldConfig: unknown
	/**
	 * Collection relation that this field belongs to
	 */
	collection?: EntityRef<CollectionMetadata>
}
