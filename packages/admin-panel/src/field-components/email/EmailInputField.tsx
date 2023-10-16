import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { EmailInput, EmailInputProps } from "@admin-panel/ui/forms/EmailInput"
import { InputFieldProps } from "../types/InputFieldProps"

/**
 * InputEmailField
 */
export const EmailInputField = (props: InputFieldProps): JSX.Element => {
	const validate = useStringValidation(props.fieldConfig?.component?.email, props.validate)
	const toPass = useInputAdapter<EmailInputProps>(props, { validate })
	return <EmailInput {...toPass} />
}
