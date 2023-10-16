import { TextInput, TextInputProps } from "./TextInput"

export type EmailInputProps = Omit<TextInputProps, "type">

export function EmailInput(props: EmailInputProps): JSX.Element {
	return <TextInput {...props} type="email" />
}
