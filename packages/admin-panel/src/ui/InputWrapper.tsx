import { clsx } from "clsx"
import { ForwardedRef, forwardRef, ReactNode } from "react"

type InputLabelProps = JSX.IntrinsicElements["label"] & {
	hideRequiredSign?: boolean
	required?: boolean
	as?: any
	error?: boolean
}

export const helperTextCss = (params: { error?: boolean; className?: string }): string => {
	return clsx(
		"min-h-6 px-2 py-1 text-xs text-opacity-70 ", //
		params.error && "text-error-content",
		params.className,
	)
}

export const labelCss = (params: {
	error?: boolean
	required?: boolean
	hideRequiredSign?: boolean
	className?: string
}): string => {
	return clsx(
		" text-opacity-70 ",
		" whitespace-nowrap py-0.5 pl-2 pr-2 text-sm",
		"s-label",
		params.error ? "text-error-content" : "",
		params.required && params.hideRequiredSign !== true && "s-required",
		params.className,
	)
}

export const InputLabel = forwardRef(
	(props: InputLabelProps, ref: ForwardedRef<HTMLLabelElement>) => {
		const { hideRequiredSign, required, error, className, ...rest } = props

		return (
			<label {...rest} ref={ref} className={labelCss(props)}>
				{props.children}
				{/* {isRequired && props.hideAsterisk !== true && <span className="select-none">*</span>} */}
			</label>
		)
	},
)

export function InputHelperText(props: { text?: string; error?: boolean }): JSX.Element {
	if (props.text === undefined) return <></>
	// 1rem is line height for text-xs
	return <p className={helperTextCss(props)}>{props.text}</p>
}

export function InputStartIcon(props: { icon?: ReactNode }): JSX.Element {
	if (!props.icon) return <></>
	return (
		<div className="absolute left-0 top-0 bottom-0">
			<div className="relative h-full w-full">{props.icon}</div>
		</div>
	)
}

export function InputEndIcon(props: { icon?: ReactNode }): JSX.Element {
	if (!props.icon) return <></>
	return (
		<div className="absolute right-0 top-0 bottom-0">
			<div className="center relative h-full w-full">{props.icon}</div>
		</div>
	)
}

// It's responsive, it switches to top when on small screens
// export const labelPositionCss = {
// 	left: /* tw */ "flex flex-1 sm:flex-row sm:items-center flex-col items-start ",
// 	right: /*tw*/ "flex flex-1 sm:flex-row-reverse sm:items-center sm:justify-end ",
// 	top: /* tw */ "flex flex-1 flex-col-reverse items-start ",
// 	bottom: /* tw */ "flex flex-1 flex-col items-start",
// } as const

// It's responsive, it switches to top when on small screens
// const useLabelPositionCss = (position?: "left" | "right" | "top" | "bottom") => {
// 	return useMemo(() => {
// 		switch (position) {
// 			case "left":
// 				return "sm:flex-row sm:items-center flex-col items-start"
// 			case "right":
// 				return "sm:flex-row-reverse sm:items-center sm:justify-end"
// 			case "bottom":
// 				return "flex-col-reverse items-start"
// 			// top is default
// 			case "top":
// 			default:
// 				return "flex-col items-start"
// 		}
// 	}, [position])
// }

export const InputWrapper = forwardRef<
	any,
	{
		label?: ReactNode | string
		labelPosition?: "left" | "right" | "top" | "bottom"
		children?: ReactNode
		helpText?: string
		className?: string
		labelProps?: Parameters<typeof InputLabel>[0]
		id?: string
		error?: string
		required?: boolean
	}
>((props, ref) => {
	const { children, label, helpText, labelPosition, required, labelProps, id, error, ...rest } =
		props

	// const labelPositionCss = useLabelPositionCss(labelPosition)

	return (
		<div
			ref={ref as any}
			{...rest}
			className={clsx(
				rest.className,
				"flex w-full flex-1",
				"flex-col",
				// flex flex-1 flex-col-reverse items-start
				// labelPositionCss[labelPosition ?? "top"],
			)}
		>
			{/* Render our label if value is string */}
			{typeof props.label !== "string" ? (
				props.label
			) : (
				<InputLabel
					error={props.error !== undefined}
					htmlFor={props.id}
					required={props.required}
					{...(labelProps ?? {})}
				>
					{props.label}
				</InputLabel>
			)}
			{children}
			<InputHelperText text={props.error ?? helpText} error={props.error !== undefined} />
		</div>
	)
})
