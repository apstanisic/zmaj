import { cn } from "@admin-panel/utils/cn"
import { forwardRef, useMemo } from "react"
import { Button, ButtonProps } from "react-aria-components"
import { useNavigate } from "react-router-dom"
import { ButtonCustomization, getButtonCss } from "./button-css"

export type IconButtonProps = ButtonProps &
	ButtonCustomization & {
		"aria-label": string
		/**
		 * @deprecated
		 */
		href?: string
		shape?: "circle" | "square"
	}

export const IconButton = forwardRef<any, IconButtonProps>(function (props, ref): JSX.Element {
	const { children, href, shape = "circle", className, variant, color, size, ...raProps } = props
	const nav = useNavigate()
	const style = useMemo(
		() =>
			getButtonCss({
				...props,
				color: props.color ?? "transparent",
				variant: props.variant ?? "text",
			}),
		[props],
	)

	return (
		<Button
			{...raProps}
			ref={ref}
			onPress={
				href ? () => nav(href.startsWith("#") ? href.substring(1) : href) : props.onPress
			}
			className={cn(
				style,
				"center",
				shape === "square" ? "du-btn-square" : "du-btn-circle",
				className,
			)}
		>
			{props.children}
		</Button>
	)
})

export function getIconButtonCss(
	props: Pick<IconButtonProps, "shape" | "className" | "color" | "variant" | "size">,
): string {
	return cn(
		getButtonCss(props),
		"center",
		props.shape === "square" ? "du-btn-square" : "du-btn-circle",
		props.className,
	)
}
