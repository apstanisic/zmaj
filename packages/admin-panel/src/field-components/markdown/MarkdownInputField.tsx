import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { useInputAdapter } from "@admin-panel/shared/input/useInputField"
import { MarkdownInput, MarkdownInputProps } from "@admin-panel/ui/forms/CodeInput/MarkdownInput"
import { memo } from "react"
import { InputFieldProps } from "../types/InputFieldProps"

export const MarkdownInputField = memo((props: InputFieldProps) => {
	const validate = useStringValidation(props.fieldConfig?.component?.markdown, props.validate)

	const asProps = useInputAdapter<MarkdownInputProps>(props, { validate })

	return <MarkdownInput {...asProps} />
})
