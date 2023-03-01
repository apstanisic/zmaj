import { UseToManyInputResult2 } from "@admin-panel/generator/to-many/input/useToManyInput"

export type ToManyInputContext = {
	/**
	 * Template that is used to render right side of the relations
	 */
	template: string
	/**
	 * Can user do changes in relation
	 */
	disabled: boolean
	/**
	 * Can't fk be deleted. It depends on weather fk value can be null
	 * Only applicable in "edit"
	 */
	deletable: boolean
	/**
	 * Right side field label
	 */
	label: string
	/**
	 * Changes made to this relation
	 */
	changes: UseToManyInputResult2
	/**
	 * Should dialog to add records be open
	 */
	pickerOpen: boolean
	/**
	 * Show picker to add records
	 */
	setPickerOpen: (open: boolean) => unknown
}
