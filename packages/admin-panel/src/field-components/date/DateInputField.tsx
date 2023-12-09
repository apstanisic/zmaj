import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 */
export function DateInputField(props: InputFieldProps) {
	// it does not accept null as default value
	return <DefaultInputField {...props} type="date" defaultValue={props.defaultValue ?? ""} />
}
