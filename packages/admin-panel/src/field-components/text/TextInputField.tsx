import { useFieldContext2 } from "@admin-panel/context/field-context"
import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { TextInput, TextInputProps } from "@admin-panel/ui/forms/TextInput"
import { InputFieldProps } from "../types/InputFieldProps"

export function TextInputField(props: InputFieldProps): JSX.Element {
	const field = useFieldContext2(props.source)
	const compName = field?.componentName ?? field?.dataType ?? "short-text"
	const textConfig = field?.fieldConfig.component?.[compName]
	const validate = useStringValidation(textConfig as any, props.validate)

	const asProps = useInputAdapter<TextInputProps>(props, { validate })
	return <TextInput {...asProps} />
}
