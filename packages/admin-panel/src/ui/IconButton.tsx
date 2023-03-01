import { clsx } from "clsx"
import { forwardRef } from "react"
import { Except } from "type-fest"
import { Button, ButtonProps } from "./Button"

export type IconButtonProps = Except<ButtonProps, "startIcon" | "endIcon" | "small"> & {
	label: string
	large?: boolean
}

export const IconButton = forwardRef<any, IconButtonProps>((props, ref) => {
	const { children, label, className, large, ...rest } = props

	return (
		<Button
			{...rest}
			className={clsx("center du-btn-circle aspect-square", className)}
			variant={props.variant ?? "transparent"}
			outline={props.variant && props.variant !== "transparent"}
			small={large !== true}
			aria-label={props["aria-label"] ?? props.label}
			ref={ref}
		>
			{children}
		</Button>
	)
})
