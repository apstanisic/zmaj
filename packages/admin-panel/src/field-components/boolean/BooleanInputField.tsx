import { SwitchInput } from "@admin-panel/ui/forms/SwitchInput"
import { useInput } from "ra-core"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * @todo Implement boolean with null
 */
export const BooleanInputField = memo((props: InputFieldProps): JSX.Element => {
	const {
		field,
		isRequired,
		fieldState: { error },
		id,
	} = useInput({
		...props,
		defaultValue: props.defaultValue ?? false,
	})

	return (
		<SwitchInput
			isSelected={field.value === true}
			name={field.name}
			onBlur={field.onBlur}
			isDisabled={field.disabled}
			id={id}
			className={props.className}
			description={props.description ?? undefined}
			error={error?.message}
			label={props.label}
			isRequired={isRequired}
			onChange={(value) => field.onChange({ target: { value }, currentTarget: { value } })}
		/>
	)
})
