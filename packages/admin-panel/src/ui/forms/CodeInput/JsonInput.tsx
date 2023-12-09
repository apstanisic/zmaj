import { useCallback, useState } from "react"
import { Except } from "type-fest"
import { CodeInput, CodeInputProps } from "./CodeInput"

// TODO Maybe replace any. But that would make using this input hard to use
export type JsonInputProps = Except<
	CodeInputProps,
	"language" | "onChange" | "value" | "defaultValue"
> & {
	value?: any
	defaultValue?: any
	onChange?: (newValue: any) => unknown
}

/**
 * Json Input
 *
 * Internally, this input contains value state. When character is changed,
 * we check if it's valid JSON, and only call parent's `onChange` if it's valid.
 * But we change internal value that is kept as string that input editor sees.
 */
export function JsonInput(props: JsonInputProps) {
	const [internalValue, setInternalValue] = useState(
		props.value
			? typeof props.value === "string"
				? props.value
				: JSON.stringify(props.value, null, 4)
			: "",
	)

	const onChange = useCallback(
		(newVal: string) => {
			setInternalValue(newVal)
			try {
				// Only change parent value if valid JSON
				const res = JSON.parse(newVal)
				props.onChange?.(res)
			} catch (error) {}
		},
		[props],
	)
	return <CodeInput {...props} language="json" value={internalValue} onChange={onChange} />
}
