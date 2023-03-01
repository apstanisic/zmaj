import { DefaultInputField } from "@admin-panel/shared/input/DefaultInputField"
import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { InputFieldProps } from "../types/InputFieldProps"

export function TextareaInputField(props: InputFieldProps): JSX.Element {
	const rows = props.fieldConfig?.component?.textarea?.rows

	const validate = useStringValidation(props.fieldConfig?.component?.textarea, props.validate)
	return (
		<DefaultInputField {...props} validate={validate} customProps={{ multiline: true, rows }} />
	)
}
