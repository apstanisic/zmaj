import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { IconButton } from "@admin-panel/ui/IconButton"
import { useTranslate } from "ra-core"
import { memo } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import { useToggle } from "react-use"
import { DefaultInputField } from "../../shared/input/DefaultInputField"
import { InputFieldProps } from "../types/InputFieldProps"

// RA PasswordInput does not allow input props
export const PasswordInputField = memo((props: InputFieldProps) => {
	const [visible, toggleVisible] = useToggle(false)
	const translate = useTranslate()

	const validate = useStringValidation(props.fieldConfig?.component?.password, props.validate)

	return (
		<DefaultInputField
			{...props}
			validate={validate}
			customProps={{
				type: visible ? "text" : "password",
				endIcon: (
					<IconButton
						label="Toggle password visibility"
						aria-label={translate(
							visible //
								? "ra.input.password.toggle_visible"
								: "ra.input.password.toggle_hidden",
						)}
						onClick={toggleVisible}
					>
						{visible ? <MdVisibility /> : <MdVisibilityOff />}
					</IconButton>
				),
			}}
		/>
	)
})
