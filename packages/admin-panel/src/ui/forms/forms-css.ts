import { cn } from "@admin-panel/utils/cn"
import { NumberFieldProps, SelectProps, TextFieldProps } from "react-aria-components"
import { CheckboxProps } from "./Checkbox"
import { ToggleProps } from "./SwitchInput"

type CommonProps = { error?: string } & (
	| TextFieldProps
	| NumberFieldProps
	| SelectProps<object>
	| ToggleProps
	| CheckboxProps
)

export const borderCss = cn(
	"border-2 border-stone-300 focus-within:border-stone-500",
	"dark:border-slate-600 dark:focus-within:border-gray-400 rounded-md",
)

export const inputCss = cn(
	"placeholder:text-gray-400 text-md outline-none w-full bg-transparent disabled:text-base-content/70 px-2",
)

export function getLabelCss(props: CommonProps): string {
	return cn(
		"text-base-content/70 inline-block pb-1",
		props.error && "text-error",
		props.isRequired && "required-asterisk",
	)
}

export function getInputBoxCss(props: CommonProps): string {
	return cn(
		"min-h-12 relative w-full flex items-stretch",
		"text-left text-black",
		props.isDisabled && "bg-stone-200 text-opacity-70 dark:bg-stone-700",
		"focus-within:shadow",
		"dark:text-gray-100 outline-none",
		borderCss,
	)
}
