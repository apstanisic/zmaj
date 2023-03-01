import { useObjectRef } from "@react-aria/utils"
import { clsx } from "clsx"
import { forwardRef, ReactNode, useMemo } from "react"
import { AriaTextFieldOptions, TextFieldAria, useTextField } from "react-aria"
import { useMeasure } from "react-use"
import { helperTextCss, labelCss } from "./InputWrapper"

// ts complaining that types are not exported when specify manually

export type TextInputProps<T extends "input" | "textarea"> = AriaTextFieldOptions<T> & {
	className?: string
	hideRequiredSign?: boolean //
	startIcon?: ReactNode
	endIcon?: ReactNode
	multiline?: boolean
	rows?: number
} //& ({ multiline: true; rows?: number } | { multiline?: false; rows?: undefined })

export const TextInput = forwardRef<any, TextInputProps<any>>((props, ref) => {
	const { startIcon, endIcon, label, hideRequiredSign, multiline, rows, className, ...rest } = props

	// problem with ts on passing inputProps
	const Component = (multiline ? "textarea" : "input") as "input"
	const domRef = useObjectRef(ref)
	const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
		{
			...rest,
			label,
			inputElementType: Component,
			validationState: props.errorMessage ? "invalid" : "valid",
		},
		domRef,
	)
	const inputCss = clsx("s-input", props.errorMessage && "s-input-error")

	const [endRef, endInfo] = useMeasure<any>()
	const [startRef, startInfo] = useMeasure<any>()

	const endPadding = useMemo(() => endInfo.width + 12, [endInfo.width])
	const startPadding = useMemo(() => startInfo.width + 12, [startInfo.width])

	// const multilineProps =

	return (
		<div className={clsx("w-full flex-1", className)}>
			{props.label && (
				<Label
					{...labelProps}
					error={!!props.errorMessage}
					required={rest.isRequired}
					hideRequiredSign={hideRequiredSign}
				>
					{props.label}
				</Label>
			)}

			<div className="relative w-full">
				{startIcon && (
					<span className="center absolute left-0 top-0 h-full px-1" ref={startRef}>
						{startIcon}
					</span>
				)}
				<Component
					{...inputProps}
					className={inputCss}
					ref={ref}
					style={{ paddingRight: `${endPadding}px`, paddingLeft: `${startPadding}px` }}
					{...(multiline ? { rows: rows ?? 8 } : {})}
				/>
				{endIcon && (
					<span className=" center absolute right-0 top-0 h-full px-1" ref={endRef}>
						{endIcon}
					</span>
				)}
			</div>

			{props.errorMessage ? (
				<HelperText error {...errorMessageProps}>
					{props.errorMessage}
				</HelperText>
			) : props.description ? (
				<HelperText error {...descriptionProps}>
					{props.description}
				</HelperText>
			) : null}
		</div>
	)
})

type HelperProps =
	| ({ error?: false } & TextFieldAria["descriptionProps"])
	| ({ error: true } & TextFieldAria["errorMessageProps"])
function HelperText(props: HelperProps & { error?: boolean }): JSX.Element {
	const { error, children, ...rest } = props
	return (
		<div {...rest} className={helperTextCss({ error })}>
			{children}
		</div>
	)
	//
}
type LabelProps = TextFieldAria["labelProps"] & {
	error?: boolean
	required?: boolean
	hideRequiredSign?: boolean
}

function Label(props: LabelProps): JSX.Element {
	const { error, required, hideRequiredSign, children, ...rest } = props

	return (
		<label {...rest} className={labelCss({ error, required, hideRequiredSign })}>
			{children}
		</label>
	)
}
