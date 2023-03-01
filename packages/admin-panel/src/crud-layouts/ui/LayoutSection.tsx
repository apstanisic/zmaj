import { clsx } from "clsx"
import { memo, PropsWithChildren } from "react"

type LayoutSectionProps = PropsWithChildren<{
	className?: string
	largeGap?: boolean
}>

export const LayoutSection = memo((props: LayoutSectionProps) => {
	return (
		<div
			className={clsx(
				"col-span-4 grid gap-x-3",
				props.largeGap ? "gap-y-4" : "gap-y-1",
				props.className,
			)}
		>
			{props.children}
		</div>
	)
})
