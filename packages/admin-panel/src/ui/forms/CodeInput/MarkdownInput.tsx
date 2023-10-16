import { CodeInput, CodeInputProps } from "./CodeInput"

export type MarkdownInputProps = CodeInputProps

export function MarkdownInput(props: MarkdownInputProps): JSX.Element {
	return <CodeInput {...props} language="markdown" />
}
