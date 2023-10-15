import { useCallback, useState } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import { IconButton } from "../buttons/IconButton"
import { TextInput, TextInputProps } from "./TextInput"

export type PasswordInputProps = Omit<TextInputProps, "type">

export function PasswordInput(props: PasswordInputProps): JSX.Element {
	const [showPassword, setShowPassword] = useState(false)

	const toggleVisibility = useCallback(() => setShowPassword((prev) => !prev), [])

	return (
		<TextInput
			{...props}
			type={showPassword ? "text" : "password"}
			endIcon={
				<IconButton
					aria-label={showPassword ? "Hide password" : "Show password"}
					onPress={toggleVisibility}
					size="small"
				>
					{showPassword ? <MdVisibilityOff /> : <MdVisibility />}
				</IconButton>
			}
		/>
	)
}
