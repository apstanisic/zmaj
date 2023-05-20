import { BaseModel, ModelType } from "@zmaj-js/orm-common"
import { CollectionMetadataModel } from "../infra-collections/collection-metadata.model"

// export type FieldMetadata = {
// 	/**
// 	 * Field info ID
// 	 */
// 	readonly id: string

// 	/**
// 	 * Created At
// 	 */
// 	readonly createdAt: Date

// 	/**
// 	 * Field name in database
// 	 * Every field has one to one mapping to database column
// 	 */
// 	readonly columnName: string

// 	/**
// 	 * Table name
// 	 */
// 	readonly tableName: string

// 	/**
// 	 * At which key column value can be accessed
// 	 */
// 	fieldName: string

// 	/**
// 	 * Can value be updated. Useful for readonly values
// 	 */
// 	canUpdate: boolean

// 	/**
// 	 * Can user provide value when creating. If not, it will use db default value
// 	 */
// 	canCreate: boolean

// 	/**
// 	 * Can this value be read. If false it will hide value on ORM level
// 	 */
// 	canRead: boolean

// 	/**
// 	 * Can we sort by this field
// 	 */
// 	sortable: boolean

// 	/**
// 	 * This is used only for showing property name in GUI, nowhere in the API is used
// 	 * If not provided, label will be generated from column name
// 	 */
// 	label: string | null

// 	/**
// 	 * Can be used by component to transform data
// 	 */
// 	displayTemplate: string | null

// 	/**
// 	 * Description for admin panel users to explain what to type
// 	 * Defaults to empty string
// 	 * It's used as helper text on inputs, or as a tooltip
// 	 */
// 	description: string | null

// 	/**
// 	 * Used for deciding what component to render for field
// 	 */
// 	componentName: string | null

// 	/**
// 	 * Is this field auto timestamp for created at time
// 	 */
// 	isCreatedAt: boolean

// 	/**
// 	 * Is this field auto timestamp for updated at time
// 	 */
// 	isUpdatedAt: boolean
// 	/**
// 	 * Value is JSON, which means it can be string, number... I can't guarantee anything
// 	 */
// 	fieldConfig: unknown
// 	/**
// 	 * Collection relation that this field belongs to
// 	 */
// 	collection?: EntityRef<CollectionMetadata>
// }

export class FieldMetadataModel extends BaseModel {
	override name = "zmajFieldMetadata"
	override tableName = "zmaj_field_metadata"
	override fields = this.buildFields((f) => ({
		id: f.uuid({ isPk: true }),
		createdAt: f.createdAt({}),
		tableName: f.text({ canUpdate: false }),
		columnName: f.text({ canUpdate: false }),
		fieldName: f.text({}),
		componentName: f.text({ nullable: true }),
		sortable: f.boolean({ hasDefault: true }),
		canRead: f.boolean({ hasDefault: true }),
		canUpdate: f.boolean({ hasDefault: true }),
		canCreate: f.boolean({ hasDefault: true }),
		isCreatedAt: f.boolean({ hasDefault: true }),
		isUpdatedAt: f.boolean({ hasDefault: true }),
		label: f.text({ nullable: true }),
		displayTemplate: f.text({ nullable: true }),
		description: f.text({ nullable: true }),
		fieldConfig: f.json({}),
	}))
	collection = this.manyToOne(() => CollectionMetadataModel, {
		fkField: "tableName",
		referencedField: "tableName",
	})
}

export type FieldMetadata = ModelType<FieldMetadataModel>
