import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { SwitchInput, SwitchInputProps } from "@admin-panel/ui/forms/SwitchInput"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * @todo Implement boolean with null
 */
export const BooleanInputField = memo((props: InputFieldProps): JSX.Element => {
	const asProps = useInputAdapter<SwitchInputProps>(props, {
		defaultValue: props.defaultValue ?? false,
	})

	return <SwitchInput {...asProps} />
})
