import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { CodeInput, CodeInputProps } from "@admin-panel/ui/forms/CodeInput/CodeInput"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

type CodeInputFieldProps = InputFieldProps & {
	language?: string
}

export const CodeInputField = memo((props: CodeInputFieldProps) => {
	const language = props.language ?? props.fieldConfig?.component?.code?.syntaxLanguage ?? "plain"
	const validate = useStringValidation(props.fieldConfig?.component?.code, props.validate)

	const asProps = useInputAdapter<CodeInputProps>(props, { validate })

	return <CodeInput {...asProps} language={language} />
})
