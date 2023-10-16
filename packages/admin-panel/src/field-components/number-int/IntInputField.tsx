import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { NumberInput, NumberInputProps } from "@admin-panel/ui/forms/NumberInput"
import { maxValue, minValue, number } from "ra-core"
import { isEmpty, isInt as isInteger, isNumber } from "radash"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * Check to see if right version of uuid is used
 */
function isInt(message = "It must be whole number (integer)") {
	return (value: unknown) => {
		if (isEmpty(value)) return
		const asNumber = parseFloat(String(value))
		return isNumber(asNumber) && !isInteger(asNumber) ? message : undefined
	}
}

export const IntInputField = memo((props: InputFieldProps): JSX.Element => {
	const options = props.fieldConfig?.component?.int

	const minNumber = options?.min ?? Number.MIN_SAFE_INTEGER
	const maxNumber = options?.max ?? Number.MAX_SAFE_INTEGER

	const validate = [number(), isInt(), minValue(minNumber), maxValue(maxNumber)]

	const asProps = useInputAdapter<NumberInputProps>(props, { validate })

	return <NumberInput {...asProps} step={1} />
})
