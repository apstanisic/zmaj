import { CommonFieldProps } from "./CommonFieldProps"

/**
 * Props that must be passed to every Show field
 */

export type ShowFieldProps = CommonFieldProps<void> & {
	/** Action */
	action: "show"

	/**
	 * When value is null or undefined, should we render special text (NULL, UNKNOWN), or custom value
	 * For example, in profile page, we don't want to render NULL
	 */
	customNilText?: string

	/**
	 * For example
	 * "Hello {name}"
	 */
	displayTemplate?: string
}
