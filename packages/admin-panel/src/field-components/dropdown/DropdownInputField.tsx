import { SelectInput, SelectInputProps } from "@admin-panel/ui/forms/SelectInput"
import { choices as choicesValidate } from "ra-core"
import { useMemo } from "react"
import { useInputAdapter } from "../../shared/input/useInputField"
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

	const asProps = useInputAdapter<SelectInputProps>(props, { validate })

	return (
		<SelectInput
			{...asProps}
			options={choices as any}
			// onChange={(value) =>
			// 	field.field.onChange({ target: { value }, currentTarget: { value } })
			// }
		/>
	)
}
