import { CommonFieldProps } from "./CommonFieldProps"

export type ListFieldProps = CommonFieldProps & {
	/** Action */
	action: "list"
	/**
	 * For example
	 * "Hello {name}"
	 */
	displayTemplate?: string
}
