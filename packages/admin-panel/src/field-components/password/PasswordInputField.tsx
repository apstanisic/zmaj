import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { PasswordInput, PasswordInputProps } from "@admin-panel/ui/forms/PasswordInput"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

// RA PasswordInput does not allow input props
export const PasswordInputField = memo((props: InputFieldProps) => {
	const validate = useStringValidation(props.fieldConfig?.component?.password, props.validate)

	const asProps = useInputAdapter<PasswordInputProps>(props, { validate })
	return <PasswordInput {...asProps} />
})
