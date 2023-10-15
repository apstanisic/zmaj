import { FieldDef } from "@zmaj-js/common"
import { RaRecord } from "ra-core"

/**
 * Every component common props
 */

export type CommonFieldProps = {
	/** Field name */
	source: string
	/**
	 * Field value
	 * @todo Remove any. Currently we can't pass value to react as unknown
	 */
	value: unknown | any

	/** Current record with data */
	record?: RaRecord

	/** Label */
	label: string

	/** react-admin action that is displayed */
	action?: "list" | "edit" | "create" | "show"

	/** Description that will be shown as helper text */
	description?: string | null

	/** Config for field */
	fieldConfig?: FieldDef["fieldConfig"]

	/** Field CSS Classes */
	className?: string
	// /** @experimental */
	// noContext?: boolean
}
