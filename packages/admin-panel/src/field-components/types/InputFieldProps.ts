import { Validator } from "ra-core"
// import { InputProps } from "../../ui/input-types"
import { Control } from "react-hook-form"
import { CommonFieldProps } from "./CommonFieldProps"

/** Props for input field */
export type InputFieldProps = CommonFieldProps & {
	control?: Control

	/** Input action */
	action?: "edit" | "create"

	/** Is field disabled */
	disabled?: boolean

	/** Is field required */
	isRequired?: boolean

	/** Validation that react-admin uses */
	validate?: Validator[]

	/** Convert value from record to input (record => input) */
	toInput?: (value: unknown) => unknown

	/** Convert value from input to record (input => record) */
	fromInput?: (value: unknown) => unknown

	/**
	 * THESE 2 ARE PROBLEMATIC (Should Default value from db be used as default value or as a placeholder)
	 */
	/** Default value */
	defaultValue?: unknown

	/** Placeholder value */
	placeholder?: string
}
