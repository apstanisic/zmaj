import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { TextInput, TextInputProps } from "@admin-panel/ui/forms/TextInput"
import { InputFieldProps } from "../types/InputFieldProps"

export const UrlInputField = (props: InputFieldProps): JSX.Element => {
	const validate = useStringValidation(props.fieldConfig?.component?.url, props.validate)

	const asProps = useInputAdapter<TextInputProps>(props, { validate })
	return <TextInput {...asProps} type="url" />
}
