import { TextInput } from "@admin-panel/ui/forms/TextInput"
import { memo } from "react"
import { InputFieldProps } from "../../field-components/types/InputFieldProps"
import { useInputField } from "./useInputField"

export const DefaultInputField = memo((props: InputFieldProps<any>) => {
	const inp = useInputField({
		source: props.source,
		description: props.description,
		disabled: props.disabled,
		label: props.label,
		isRequired: props.isRequired,
		defaultValue: props.defaultValue,
		validate: props.validate,
		type: props.type,
		className: props.className,
		placeholder: props.placeholder,
	})

	// We don't want to prefix value with db default,
	// since it might be sql function
	// for example uuid_generate_v4() has invalid regex, but will generate valid uuid,
	// it won't pass validation. So we set it as placeholder
	// const defaultValue = props.defaultValue ?? ""

	return (
		<TextInput
			label={inp.label}
			description={inp.helperText}
			error={inp.error?.message}
			className={inp.className}
			isDisabled={inp.disabled}
			isRequired={inp.isRequired}
			placeholder={inp.placeholder}
			type={inp.type}
			// name={ip.name}
			{...inp.field}
		/>
	)
})
