import { useObjectRef } from "@react-aria/utils"
import { clsx } from "clsx"
import { ElementType, forwardRef, ReactNode } from "react"
import { AriaButtonProps, useButton } from "react-aria"
import { StyleVariant } from "./StyleVariant"

const colors: Record<StyleVariant, string> = {
	accent: "du-btn-accent",
	error: "du-btn-error",
	info: "du-btn-info",
	link: "du-btn-link",
	primary: "du-btn-primary",
	secondary: "du-btn-secondary",
	success: "du-btn-success",
	warning: "du-btn-warning",
	normal: "",
	transparent: "du-btn-ghost",
}

export type ButtonProps = {
	outline?: boolean
	variant?: StyleVariant
	link?: boolean
	startIcon?: ReactNode
	endIcon?: ReactNode
	href?: string
	small?: boolean
	wrap?: boolean
	active?: boolean
	className?: string
	// replace with onPress gradually
	onClick?: () => void
	// replace with isDisabled gradually
	disabled?: boolean
} & AriaButtonProps<ElementType>

export const Button = forwardRef<any, ButtonProps>((props, ref) => {
	const {
		outline,
		variant,
		link,
		startIcon,
		endIcon,
		small,
		wrap,
		active,
		onClick,
		children,
		className,
		disabled: _d,
		...rest //
	} = props
	const Component = props.elementType ?? props.href ? "a" : "button"

	const domRef = useObjectRef(ref)
	const isDisabled = props.isDisabled ?? props.disabled
	// onClick supported because of BC,
	const btn = useButton(
		{
			...rest,
			elementType: Component,
			onPress: onClick ?? rest.onPress,
			isDisabled,
		},
		domRef,
	)

	return (
		<Component
			{...btn.buttonProps}
			className={clsx(
				"du-btn gap-x-1",
				outline && "du-btn-outline",
				// "active:bg-blue-100",
				colors[variant ?? "normal"],
				className,
				small && "du-btn-sm",
				wrap !== true && "whitespace-nowrap",
				active && "du-btn-active",
				// daisyui is to dark by default
				isDisabled && "!bg-opacity-5  text-opacity-60",
			)}
			ref={domRef}
		>
			{startIcon && <span className="center h-6 w-6">{startIcon}</span>}
			{children}
			{endIcon && <span className="center h-6 w-6">{endIcon}</span>}
		</Component>
	)
})
