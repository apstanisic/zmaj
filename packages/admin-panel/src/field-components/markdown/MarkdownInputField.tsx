import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { memo } from "react"
import { CodeInputField } from "../code/CodeInputField"
import { InputFieldProps } from "../types/InputFieldProps"

export const MarkdownInputField = memo((props: InputFieldProps) => {
	const validate = useStringValidation(props.fieldConfig?.component?.markdown, props.validate)
	return <CodeInputField {...props} validate={validate} language="markdown" />
})
