import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { MultilineTextInput } from "@admin-panel/ui/forms/MultilineTextInput"
import { useInput } from "ra-core"
import { InputFieldProps } from "../types/InputFieldProps"

export function TextareaInputField(props: InputFieldProps): JSX.Element {
	const rows = props.fieldConfig?.component?.textarea?.rows ?? 8

	const validate = useStringValidation(props.fieldConfig?.component?.textarea, props.validate)
	const {
		field: { ref, ...field },
		id,
		isRequired,
		fieldState: { error },
	} = useInput({
		source: props.source,
		control: props.control,
		disabled: props.disabled,
		isRequired: props.isRequired,
		defaultValue: props.defaultValue,
		validate,
	})

	return (
		<MultilineTextInput
			{...field}
			isRequired={isRequired}
			id={id}
			lines={rows}
			className={props.className}
			label={props.label}
			description={props.description ?? undefined}
			error={error?.message}
			placeholder={props.placeholder}
			isDisabled={props.disabled}
		/>
	)
}
