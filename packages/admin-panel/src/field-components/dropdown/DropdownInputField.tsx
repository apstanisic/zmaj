import { SelectInput } from "@admin-panel/ui/forms/SelectInput"
import { choices as choicesValidate } from "ra-core"
import { useMemo } from "react"
import { useInputField } from "../../shared/input/useInputField"
import { InputFieldProps } from "../types/InputFieldProps"

type DropdownInputFieldProps = InputFieldProps & { choices?: any } // z.infer<typeof DropdownChoices> }

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

	const validate = useMemo(() => choicesValidate(choices.map((o: any) => o.value)), [choices])

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
		<SelectInput
			options={choices as any}
			value={field.field.value}
			isDisabled={field.disabled}
			error={field.error?.message}
			className={field.className}
			name={field.field.name}
			isRequired={field.isRequired}
			label={field.label}
			onChange={(value) =>
				field.field.onChange({ target: { value }, currentTarget: { value } })
			}
			description={field.helperText}
		/>
	)
}
