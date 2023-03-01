import { DropdownChoices } from "@zmaj-js/common"
import { choices as choicesValidate } from "ra-core"
import { useMemo } from "react"
import { z } from "zod"
import { useInputField } from "../../shared/input/useInputField"
import { Select } from "../../ui/Select"
import { InputFieldProps } from "../types/InputFieldProps"

type DropdownInputFieldProps = InputFieldProps & { choices?: z.infer<typeof DropdownChoices> }

/**
 * I managed to reuse `DefaultInputField`, and most of it's functionality
 *
 * @param props Standard input props with option to provide choices directly
 * @returns Dropdown component
 */
export function DropdownInputField(props: DropdownInputFieldProps): JSX.Element {
	const choices = useMemo(
		() => props.choices ?? props.fieldConfig?.component?.dropdown?.choices ?? [],
		[props.choices, props.fieldConfig],
	)

	const validate = useMemo(() => choicesValidate(choices.map((o) => o.value)), [choices])

	const field = useInputField({
		source: props.source,
		defaultValue: props.defaultValue,
		description: props.description,
		disabled: props.disabled,
		label: props.label,
		placeholder: props.placeholder,
		isRequired: props.isRequired,
		validate: [validate, ...(props.validate ?? [])],
		className: props.className,
	})

	return (
		<Select
			choices={choices as any}
			value={field.field.value}
			disabled={field.disabled}
			error={field.error?.message}
			className={field.className}
			name={field.field.name}
			required={field.isRequired}
			label={field.label}
			onChange={(value) => field.field.onChange({ target: { value }, currentTarget: { value } })}
			helperText={field.helperText}
		/>
	)
}
