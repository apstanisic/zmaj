import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { email } from "ra-core"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * InputEmailField
 */
export const EmailInputField = (props: InputFieldProps): JSX.Element => {
	const validate = useStringValidation(props.fieldConfig?.component?.email, props.validate)
	return <DefaultInputField {...props} validate={[...validate, email()]} type="email" />
}
