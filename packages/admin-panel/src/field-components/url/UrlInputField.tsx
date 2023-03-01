import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { Validator } from "ra-core"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export const UrlInputField = (props: InputFieldProps): JSX.Element => {
	const validate = useStringValidation(props.fieldConfig?.component?.url, props.validate)
	return <DefaultInputField {...props} validate={[...validate, validUrl()]} type="url" />
}

/**
 * Check to see if valid is valid url
 */
const validUrl = (message = "Invalid URL"): Validator => {
	return (value: string) => {
		if (!value) return
		try {
			const url = new URL(value)
			return
		} catch (error) {
			return message
		}
	}
}
