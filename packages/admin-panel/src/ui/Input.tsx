import { clsx } from "clsx"
import { ForwardedRef, forwardRef, ReactNode, useMemo, useState } from "react"
import { useMeasure } from "react-use"
import { v4 } from "uuid"
import { InputWrapper } from "./InputWrapper"

export type CustomInputProps = {
	start?: ReactNode
	end?: ReactNode
	label?: string | ReactNode
	helperText?: string
	error?: string
	labelPosition?: "top" | "bottom" | "left" | "right"
	hideRequiredSign?: boolean
}

export type NativeInputProps =
	| JSX.IntrinsicElements["input"]
	| JSX.IntrinsicElements["textarea"]
	| JSX.IntrinsicElements["select"]

export type CommonInputProps<T extends NativeInputProps> = T & CustomInputProps

export type InputProps = JSX.IntrinsicElements["input"] & CustomInputProps
export type MultilineInputProps = JSX.IntrinsicElements["textarea"] & CustomInputProps
type TaggedProps =
	| (InputProps & { multiline?: false })
	| (MultilineInputProps & { multiline: true })

export function Input(props: InputProps): JSX.Element {
	const { helperText, end, start, label, ref, error, labelPosition, hideRequiredSign, ...rest } =
		props

	const [id] = useState(props.id ?? `input_${v4()}`)

	return (
		<InputWrapper
			helpText={props.helperText}
			className={clsx(props.className)}
			error={error}
			labelProps={{ htmlFor: id, hideRequiredSign }}
			label={label}
			labelPosition={labelPosition}
		>
			<InputWithIcons {...rest} id={id} error={error} start={start} end={end} />
		</InputWrapper>
	)
}

const InputWithIcons = forwardRef<any, TaggedProps>((props, ref) => {
	// this is not expensive since it won't observe anything if ref is not used
	const [endRef, endInfo] = useMeasure()
	const [startRef, startInfo] = useMeasure()

	const endPadding = useMemo(() => endInfo.width + 12, [endInfo.width])
	const startPadding = useMemo(() => startInfo.width + 12, [startInfo.width])

	return (
		<div className="relative flex w-full items-center">
			{props.start && (
				<div className="center absolute left-0 h-full" ref={startRef as any}>
					{props.start}
				</div>
			)}
			<CoreInput
				{...props}
				error={props.error}
				className={clsx(props.className)}
				style={{ paddingRight: `${endPadding}px`, paddingLeft: `${startPadding}px` }}
				ref={ref}
			/>
			{props.end && (
				<div className=" center absolute right-0 h-full " ref={endRef as any}>
					{props.end}
				</div>
			)}
		</div>
	)
})

export const CoreInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, TaggedProps>(
	(props, ref) => {
		const className = clsx("s-input", props.error && "s-input-error", props.className)
		if (props.multiline) {
			const { multiline, error, ...rest } = props
			return (
				<textarea {...rest} className={className} ref={ref as ForwardedRef<HTMLTextAreaElement>} />
			) //
		} else {
			const { multiline, error, ...rest } = props
			return <input {...rest} className={className} ref={ref as ForwardedRef<HTMLInputElement>} />
		}
	},
)
