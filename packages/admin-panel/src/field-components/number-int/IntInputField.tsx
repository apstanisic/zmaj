import { NumberInput } from "@admin-panel/ui/forms/NumberInput"
import { maxValue, minValue, number, useInput } from "ra-core"
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

	const {
		field,
		fieldState: { error },
		isRequired,
		id,
	} = useInput({
		source: props.source,
		defaultValue: props.defaultValue,
		disabled: props.disabled,
		isRequired: props.isRequired,
		validate,
	})

	return (
		<NumberInput
			id={id}
			step={Math.round(options?.step ?? 1)}
			minValue={options?.min ?? undefined}
			maxValue={options?.max ?? undefined}
			isRequired={isRequired}
			isDisabled={field.disabled}
			defaultValue={props.defaultValue as any}
			name={field.name}
			value={field.value}
			onBlur={field.onBlur}
			onChange={(value) => field.onChange({ target: { value } })}
			className={props.className}
			label={props.label}
			description={props.description ?? undefined}
			placeholder={props.placeholder}
			error={error?.message}
		/>
	)
})
