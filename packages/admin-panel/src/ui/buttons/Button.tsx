import { forwardRef, ReactNode, useMemo } from "react"
import { Button as RaButton, ButtonProps as RaButtonProps } from "react-aria-components"
import { useNavigate } from "react-router-dom"
import { ButtonCustomization, getButtonCss } from "./button-css"

export type ButtonProps = Omit<RaButtonProps, "children"> &
	ButtonCustomization & {
		className?: string
		children?: ReactNode
		//
		startIcon?: ReactNode
		endIcon?: ReactNode
		/**
		 * @deprecated
		 */
		href?: string
	}

export const Button = forwardRef<any, ButtonProps>(function Button(props, ref) {
	const {
		startIcon,
		endIcon,
		className,
		color,
		size,
		variant,
		onPress,
		href,
		...raProps //
	} = props
	const nav = useNavigate()
	const css = useMemo(() => getButtonCss(props), [props])

	return (
		<RaButton
			{...raProps}
			ref={ref}
			onPress={href ? () => nav(href.startsWith("#") ? href.substring(1) : href) : onPress}
			className={css}
		>
			{startIcon && <span className="center h-6 w-6">{startIcon}</span>}
			{props.children}
			{endIcon && <span className="center h-6 w-6">{endIcon}</span>}
		</RaButton>
	)
})
