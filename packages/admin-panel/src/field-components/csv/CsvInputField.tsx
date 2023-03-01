import { memo } from "react"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * In csv field order is important, so we simply show Text Input
 * We can't delete
 */

export const CsvInputField = memo((props: InputFieldProps) => {
	return <DefaultInputField {...props} />
})
