import { cn } from "@admin-panel/utils/cn"
import { clsx } from "clsx"
import { CodeJar } from "codejar"
import { memo, useCallback, useEffect, useRef, useState } from "react"
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
		id = "test",
		onChange: propsOnChange,
		language = "plain",
	} = props

	const [internalValue, setInternalValue] = useState(defaultValue ?? "")

	const value = props.value ?? internalValue
	const onChange = useCallback(
		(newValue: string) => {
			props.value ? propsOnChange?.(newValue) : setInternalValue(newValue)
			// propsOnChange ? propsOnChange(val) : setInternalValue(val)
		},
		[props.value, propsOnChange],
	)

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
		<div>
			<FormControl description={description} error={error} isRequired={props.isRequired}>
				<input
					type="hidden"
					name={name}
					value={value}
					disabled={isDisabled}
					id={id}
					aria-description={error ?? description}
					aria-label={label}
					onChange={(e) => props.onChange?.(e.target.value)}
				/>
				{label && (
					<p
						className={cn(getLabelCss(props), "cursor-default")}
						aria-hidden
						onClick={() => inputRef.current?.focus()}
					>
						{label}
					</p>
				)}
				<div className={getInputBoxCss(props)} aria-hidden>
					<code
						contentEditable={!props.isDisabled}
						className={clsx(`language-${language} w-full min-h-[196px] p-2`)}
						ref={inputRef}
					></code>
				</div>
			</FormControl>
		</div>
	)
})
