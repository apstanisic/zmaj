import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { PasswordInput } from "@admin-panel/ui/forms/PasswordInput"
import { useInput } from "ra-core"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

// RA PasswordInput does not allow input props
export const PasswordInputField = memo((props: InputFieldProps) => {
	const validate = useStringValidation(props.fieldConfig?.component?.password, props.validate)

	const {
		field: { ref, ...field },
		id,
		isRequired,
		fieldState: { error },
	} = useInput({
		source: props.source,
		control: props.control,
		isRequired: props.isRequired,
		defaultValue: props.defaultValue,
		disabled: props.disabled,
		validate,
	})

	return (
		<PasswordInput
			{...field}
			isRequired={isRequired}
			id={id}
			className={props.className}
			label={props.label}
			description={props.description ?? undefined}
			error={error?.message}
			placeholder={props.placeholder}
			isDisabled={props.disabled}
		/>
	)
})
