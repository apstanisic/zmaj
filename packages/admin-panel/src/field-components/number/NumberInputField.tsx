import { maxValue, minValue } from "ra-core"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export const NumberInputField = (props: InputFieldProps): JSX.Element => {
	const minNumber = minValue(props.fieldConfig?.component?.float?.min ?? Number.MIN_SAFE_INTEGER)
	const maxNumber = maxValue(props.fieldConfig?.component?.float?.max ?? Number.MAX_SAFE_INTEGER)

	return <DefaultInputField {...props} type="number" validate={[minNumber, maxNumber]} />
}
