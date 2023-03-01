import { memo } from "react"
import { useInputField } from "../../shared/input/useInputField"
import { Switch } from "../../ui/Switch"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * @todo Implement boolean with null
 */
export const BooleanInputField = memo((props: InputFieldProps): JSX.Element => {
	const { field, ...rest } = useInputField({
		...props,
		defaultValue: typeof props.defaultValue === "boolean" ? props.defaultValue : false,
	})

	return (
		<Switch
			isSelected={field.value}
			name={field.name}
			id={rest.id}
			className={rest.className}
			helperText={rest.helperText}
			error={rest.error?.message}
			label={rest.label}
			required={rest.isRequired}
			onChange={(value) => field.onChange({ target: { value }, currentTarget: { value } })}
			isDisabled={rest.disabled}
		/>
	)
})
