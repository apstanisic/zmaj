import { cn } from "@admin-panel/utils/cn"
import { clsx } from "clsx"
import { CodeJar } from "codejar"
import { memo, useCallback, useEffect, useId, useRef, useState } from "react"
import { FormControl } from "../FormControl"
import { TextInputProps } from "../TextInput"
import { getInputBoxCss, getLabelCss } from "../forms-css"
import { Highlight } from "./highlight.lib"

export type CodeInputProps = Pick<
	TextInputProps,
	| "label"
	| "description"
	| "error"
	| "onChange"
	| "className"
	| "value"
	| "isDisabled"
	| "isRequired"
	| "name"
	| "id"
	| "defaultValue"
> & {
	language?: string
}

export const CodeInput = memo((props: CodeInputProps) => {
	const {
		label,
		name,
		isDisabled,
		description,
		error,
		defaultValue,
		id,
		onChange: propsOnChange,
		language = "plain",
	} = props

	const labelId = useId()

	const [internalValue, setInternalValue] = useState(defaultValue ?? "")

	const value = props.value ?? internalValue
	const onChange = useCallback(
		(newValue: string) => {
			props.value !== undefined ? propsOnChange?.(newValue) : setInternalValue(newValue)
		},
		[props.value, propsOnChange],
	)

	const inputRef = useRef<HTMLInputElement>(null)
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
			{ catchTab: false, addClosing: false },
		)

		// Set start value
		jar.current.updateCode(value)
		// When we update code, update value
		jar.current.onUpdate((code) => {
			onChange(code)
		})
		return () => {
			jar.current?.destroy()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language])

	return (
		<div className={props.className}>
			<FormControl description={description} error={error} isRequired={props.isRequired}>
				<input
					type="hidden"
					name={name}
					value={value}
					disabled={isDisabled}
					id={id ? `hidden_input_${id}` : undefined}
					aria-description={error ?? description}
					aria-labelledby={labelId}
					onChange={(e) => props.onChange?.(e.target.value)}
				/>
				{label && (
					<label
						className={cn(getLabelCss(props), "cursor-default")}
						aria-hidden
						onClick={() => inputRef.current?.focus()}
						id={labelId}
					>
						{label}
					</label>
				)}
				<div className={getInputBoxCss(props)}>
					<code
						contentEditable={!props.isDisabled}
						className={clsx(`language-${language} w-full min-h-[196px] p-2`)}
						ref={inputRef}
						id={id ? `code_input_${id}` : undefined}
					></code>
				</div>
			</FormControl>
		</div>
	)
})
