import { cn } from "@admin-panel/utils/cn"
import { ButtonStyleColor, ButtonVariant, SizeVariant } from "../StyleVariant"
import { ButtonProps } from "./Button"
import { IconButtonProps } from "./IconButton"

const colors: Record<ButtonStyleColor, string> = {
	accent: cn("du-btn-accent"),
	error: cn("du-btn-error"),
	info: cn("du-btn-info"),
	link: cn("du-btn-link"),
	primary: cn("du-btn-primary"),
	secondary: cn("du-btn-secondary"),
	success: cn("du-btn-success"),
	warning: cn("du-btn-warning"),
	normal: cn(""),
	transparent: cn("du-btn-ghost"),
}

const sizes: Record<SizeVariant, string> = {
	small: cn("du-btn-sm"),
	medium: cn("du-btn-md"),
	large: cn("du-btn-lg"),
}

const variants: Record<ButtonVariant, string> = {
	normal: cn(""),
	outlined: cn("du-btn-outline"),
	text: cn("border-none bg-transparent focus-visible:bg-neutral/20"),
}

export function getButtonCss(props: ButtonProps | IconButtonProps): string {
	const { className, size = "medium", color = "normal", variant = "normal" } = props
	return cn(
		"du-btn gap-x-1",
		variants[variant],
		sizes[size],
		colors[color],
		// daisyui is to dark by default
		props.isDisabled && "!bg-opacity-5  text-opacity-60",
		//
		className,
	)
}

export type ButtonCustomization = {
	color?: ButtonStyleColor
	size?: SizeVariant
	variant?: ButtonVariant
}
