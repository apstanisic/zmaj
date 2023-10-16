import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { NumberInput, NumberInputProps } from "@admin-panel/ui/forms/NumberInput"
import { maxValue, minValue } from "ra-core"
import { InputFieldProps } from "../types/InputFieldProps"

export const NumberInputField = (props: InputFieldProps): JSX.Element => {
	const minNumber = minValue(props.fieldConfig?.component?.float?.min ?? Number.MIN_SAFE_INTEGER)
	const maxNumber = maxValue(props.fieldConfig?.component?.float?.max ?? Number.MAX_SAFE_INTEGER)

	const asProps = useInputAdapter<NumberInputProps>(props, { validate: [minNumber, maxNumber] })

	return <NumberInput {...asProps} />
}
