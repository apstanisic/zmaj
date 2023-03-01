import { IconButton } from "@admin-panel/ui/IconButton"
import { forwardRef } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import { useToggle } from "react-use"
import { TextInput, TextInputProps } from "./TextInput"

export const PasswordInput = forwardRef((props: TextInputProps<"input">, ref: any) => {
	const [visible, toggleVisible] = useToggle(false)

	return (
		<TextInput
			{...props}
			type={visible ? "text" : "password"}
			endIcon={
				<IconButton label="Toggle password visibility" onClick={toggleVisible}>
					{visible ? <MdVisibility /> : <MdVisibilityOff />}
				</IconButton>
			}
		/>
	)
})
