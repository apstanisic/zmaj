import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export function DateTimeInputField(props: InputFieldProps) {
	return (
		<DefaultInputField
			{...props}
			type="datetime-local"
			defaultValue={props.defaultValue ?? ""} //
		/>
	)
}
