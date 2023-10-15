import { useFieldContext2 } from "@admin-panel/context/field-context"
import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export function TextInputField(props: InputFieldProps): JSX.Element {
	const field = useFieldContext2(props.source)
	const compName = field?.componentName ?? field?.dataType ?? "short-text"
	const textConfig = field?.fieldConfig.component?.[compName]
	const validate = useStringValidation(textConfig as any, props.validate)

	return <DefaultInputField {...props} validate={validate} />
}
