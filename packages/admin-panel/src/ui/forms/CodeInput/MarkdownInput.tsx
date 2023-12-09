import { CodeInput, CodeInputProps } from "./CodeInput"

export type MarkdownInputProps = CodeInputProps

export function MarkdownInput(props: MarkdownInputProps) {
	return <CodeInput {...props} language="markdown" />
}
