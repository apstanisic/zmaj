import { clsx } from "clsx"

export function Avatar(props: JSX.IntrinsicElements["div"] & { large?: boolean }): JSX.Element {
	const { children, className, large, ...rest } = props
	return (
		<div
			{...rest}
			className={clsx(
				"center  du-avatar m-1 overflow-hidden rounded-full bg-base-300",
				className,
				large ? "h-14 w-14" : "h-10 w-10",
			)}
		>
			{props.children}
		</div>
	)
}
