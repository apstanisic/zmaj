import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import {
	MultilineTextInput,
	MultilineTextInputProps,
} from "@admin-panel/ui/forms/MultilineTextInput"
import { InputFieldProps } from "../types/InputFieldProps"

export function TextareaInputField(props: InputFieldProps) {
	const rows = props.fieldConfig?.component?.textarea?.rows ?? 8

	const validate = useStringValidation(props.fieldConfig?.component?.textarea, props.validate)

	const asProps = useInputAdapter<MultilineTextInputProps>(props, { validate })

	return <MultilineTextInput {...asProps} lines={rows} />
}
