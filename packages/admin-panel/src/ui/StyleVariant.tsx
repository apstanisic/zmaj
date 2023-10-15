import { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from "react-hook-form"
import { TextInputProps } from "./forms/TextInput"

export type SizeVariant = "small" | "medium" | "large"

export type ButtonVariant = "normal" | "outlined" | "text"

export type ColorVariant =
	| "normal"
	| "primary"
	| "secondary"
	| "accent"
	| "success"
	| "error"
	| "warning"
	| "info"

export type ButtonStyleColor = ColorVariant | "link" | "transparent"

/**
 * Simplifies usage with react-hook-form
 */
export type RhfRenderProps = {
	field: ControllerRenderProps<any, any>
	fieldState: ControllerFieldState
	formState: UseFormStateReturn<any>
}

export function withRhf(props: RhfRenderProps) {
	const { field, fieldState } = props

	return {
		value: field.value ?? "",
		onChange: field.onChange,
		onBlur: field.onBlur,
		name: field.name,
		isDisabled: field.disabled,
		error: fieldState.error?.message,
	} satisfies TextInputProps
}
