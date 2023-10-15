import { CodeInput, CodeInputProps } from "./CodeInput"

export function MarkdownInput(props: CodeInputProps): JSX.Element {
	return <CodeInput {...props} language="markdown" />
}
