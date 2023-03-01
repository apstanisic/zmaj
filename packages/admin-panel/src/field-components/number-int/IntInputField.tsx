import { isNumberString } from "@zmaj-js/common"
import { maxValue, minValue, number } from "ra-core"
import { isEmpty, isInt as isInteger, isNumber, isString } from "radash"
import { memo } from "react"
import { toInputProps, useInputField } from "../../shared/input/useInputField"
import { Input } from "../../ui/Input"
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

	const field = useInputField({
		...props,
		validate,
		type: "number",
		fromInput: (val: unknown) => {
			const asString = isString(val) ? val.replaceAll("e", "").replaceAll(".", "") : ""
			if (isNumberString(asString)) return parseInt(asString, 10)
			return null
		},
	})

	return (
		<Input
			{...toInputProps(field)}
			step={Math.floor(options?.step ?? 1)}
			inputMode="numeric"
			pattern="[0-9]*"
		/>
	)
})
