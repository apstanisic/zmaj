import { CommonFieldProps } from "./CommonFieldProps"

export type ListFieldProps = CommonFieldProps<void> & {
	/** Action */
	action: "list"
}
