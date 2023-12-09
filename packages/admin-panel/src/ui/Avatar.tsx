import { cn } from "@admin-panel/utils/cn"
import { SizeVariant } from "./StyleVariant"

type AvatarProps = JSX.IntrinsicElements["div"] & {
	large?: boolean
	size?: SizeVariant
}

const sizes: Record<SizeVariant, string> = {
	large: cn("h-14 w-14"),
	medium: cn("h-10 w-10"),
	small: cn("h-6 w-6"),
}

export function Avatar(props: AvatarProps) {
	const { children, className, size = "medium", ...rest } = props
	return (
		<div
			{...rest}
			className={cn(
				"center du-avatar m-1 overflow-hidden rounded-full bg-base-300",
				sizes[size],
				className,
			)}
		>
			{props.children}
		</div>
	)
}
