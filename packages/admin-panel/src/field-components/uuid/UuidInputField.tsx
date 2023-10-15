import { UuidInput } from "@admin-panel/ui/forms/UuuidInput"
import { uuidRegex } from "@zmaj-js/common"
import { regex, useInput } from "ra-core"
import { useMemo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

export const UuidInputField = (props: InputFieldProps): JSX.Element => {
	// Must be specific uuid version

	const validate = useMemo(
		() => [...(props.validate ?? []), regex(uuidRegex, "Invalid UUID")],
		[props.validate],
	)
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
		<UuidInput
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
}
