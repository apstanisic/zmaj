import { ReactNode } from "react"

// type Choice<T = unknown> = { value: T; label?: string; disabled?: boolean }

// type PropsSelect<T = unknown> = Omit<CommonInputProps, "value"> & {
// 	onChange: (value: T) => unknown
// 	choices: Choice<T>[]
// 	value: T
// }

// export type InputProps2 = Pick<
// 	JSX.IntrinsicElements["input"],
// 	"value" | "required" | "disabled" | "onChange" | "onBlur" | "onFocus" | "type"
// >
// type MultilineProps = InputProps2 & Pick<JSX.IntrinsicElements["textarea"], "rows">
export type CommonInputProps = {
	required?: boolean
	disabled?: boolean
	name?: string
	label?: string | ReactNode
	id?: string
	value?: string
	helperText?: string
	status?: "error"
	className?: string
	placeholder?: string
	hideAsterisk?: boolean
	hideHelperText?: boolean
	hideLabel?: boolean
}

// export type InputProps = CommonInputProps & {
// 	endIcon?: ReactNode
// 	startIcon?: ReactNode
// 	type?: HTMLInputTypeAttribute
// 	rows?: number
// 	step?: number
// 	inputMode?: HTMLAttributes<any>["inputMode"]
// 	pattern?: string
// 	inputRef?: RefCallback<any>
// 	onChange?: (e: ChangeEvent<HTMLInputElement>) => unknown
// 	onBlur?: () => unknown
// 	onFocus?: () => unknown
// }

// type InnerProps = Pick<
// 	InputProps,
// 	| "isRequired"
// 	| "disabled"
// 	| "name"
// 	| "placeholder"
// 	| "id"
// 	| "value"
// 	| "type"
// 	| "rows"
// 	| "step"
// 	| "onBlur"
// 	| "onChange"
// 	| "onFocus"
// > & {
// 	error?: string
// 	hasLeft?: boolean
// 	hasRight?: boolean
// }
