import { clsx } from "clsx"
import { forwardRef, ReactNode } from "react"
import { Button, ButtonProps } from "./Button"

export type ResponsiveButtonProps = Exclude<
	ButtonProps,
	"children" | "small" | "startIcon" | "endIcon"
> & {
	label: string
	icon: ReactNode
	display?: "icon" | "full" | undefined
}

export const ResponsiveButton = forwardRef<any, ResponsiveButtonProps>((props, ref) => {
	const { label, icon, display, ...rest } = props

	return (
		<Button
			ref={ref}
			variant="transparent"
			small
			{...rest}
			className={clsx(
				"whitespace-nowrap",
				display === "icon" && "du-btn-circle  aspect-square",
				display === undefined && "max-sm:aspect-square max-sm:du-btn-circle",
				props.className,
			)}
			startIcon={icon}
		>
			<span
				className={clsx(
					display === "icon" && "hidden",
					display === "full" && "pl-2",
					display === undefined && "max-sm:hidden sm:pl-2",
				)}
			>
				{label}
			</span>
		</Button>
	)
})
