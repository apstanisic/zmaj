import { TextInput, TextInputProps } from "./TextInput"

export function EmailInput(props: Omit<TextInputProps, "type">): JSX.Element {
	return <TextInput {...props} type="email" />
}
