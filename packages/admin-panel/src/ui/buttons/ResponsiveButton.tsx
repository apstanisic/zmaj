import { clsx } from "clsx"
import { ReactNode } from "react"
import { Except } from "type-fest"
import { Button, ButtonProps } from "./Button"

export type ResponsiveButtonProps = Except<ButtonProps, "children" | "startIcon" | "endIcon"> & {
	label: string
	icon: ReactNode
}

export function ResponsiveButton(props: ResponsiveButtonProps): JSX.Element {
	const { label, icon, size = "small", color = "transparent", ...rest } = props

	return (
		<Button
			{...rest}
			color={color}
			size={size}
			className={clsx(
				"whitespace-nowrap",
				"max-sm:aspect-square max-sm:du-btn-circle",
				props.className,
			)}
			startIcon={icon}
		>
			<span className={clsx("max-sm:hidden sm:pl-2")}>{label}</span>
		</Button>
	)
}
