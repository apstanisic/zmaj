import { CommonFieldProps } from "./CommonFieldProps"

/**
 * Props that must be passed to every Show field
 */

export type ShowFieldProps = CommonFieldProps & {
	/** Action */
	action?: "show"

	/**
	 * For example
	 * "Hello {value}", or "{value} euros"
	 */
	displayTemplate?: string
}
