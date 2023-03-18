import { CommonFieldProps } from "./CommonFieldProps"

export type ListFieldProps = CommonFieldProps<void> & {
	/** Action */
	action: "list"
	/**
	 * For example
	 * "Hello {name}"
	 */
	displayTemplate?: string
}
