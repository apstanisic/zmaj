import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export function TimeInputField(props: InputFieldProps) {
	// it does not accept null as default value
	return <DefaultInputField {...props} type="time" defaultValue={props.defaultValue ?? ""} />
}
