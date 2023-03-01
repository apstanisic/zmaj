import { useStringValidation } from "@admin-panel/shared/input/useCommonValidators"
import { clsx } from "clsx"
import { CodeJar } from "codejar"
import { memo, useEffect, useRef } from "react"
import { useInputField } from "../../shared/input/useInputField"
import { InputWrapper } from "../../ui/InputWrapper"
import { InputFieldProps } from "../types/InputFieldProps"
import { Highlight } from "./highlight"

type CodeInputFieldProps = InputFieldProps & {
	language?: string
	formatter?: (val: string) => string
}

export const CodeInputField = memo((props: CodeInputFieldProps) => {
	const language = props.language ?? props.fieldConfig?.component?.code?.syntaxLanguage ?? "plain"
	const validate = useStringValidation(props.fieldConfig?.component?.code, props.validate)

	const field = useInputField({ ...props, validate: validate })

	const inputRef = useRef<HTMLElement>(null)
	const jar = useRef<CodeJar | null>(null)
	useEffect(() => {
		if (!inputRef.current) return

		jar.current = CodeJar(
			inputRef.current,
			// It shows warning when we use
			// Highlight.highlightElement,
			(el) => {
				if (language === "plain") {
					el.innerHTML = String(el.textContent)
					return
				}
				el.innerHTML = Highlight.highlight(el.textContent ?? "", { language }).value
			},
			{ catchTab: false },
		)

		jar.current.updateCode(props.toInput ? props.toInput(field.field.value) : field.field.value)
		jar.current.onUpdate((code) => {
			field.field.onChange({ target: { value: code } })
		})
		return () => {
			jar.current?.destroy()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language])

	useEffect(() => {
		if (field.disabled && inputRef.current) {
			inputRef.current.contentEditable = "false"
		}
	}, [field.disabled])

	return (
		<InputWrapper
			// status={field.status}
			helpText={field.helperText}
			label={field.label}
			required={field.isRequired}
			// disabled={field.disabled}
			// required={field.isRequired}
			id={field.id}
			className={props.className}
			labelProps={{
				onClick: () => !props.disabled && inputRef.current?.focus(),
			}}
		>
			<code
				id={field.id}
				className={clsx(
					`language-${language} input max-h-[70vh] min-h-[200px]`,
					field.disabled && "s-input-disabled",
				)}
				ref={inputRef}
			></code>
		</InputWrapper>
	)
})
