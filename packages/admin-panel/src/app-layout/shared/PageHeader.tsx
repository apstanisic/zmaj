import { cn } from "@admin-panel/utils/cn"
import { ReactNode } from "react"

export function PageHeader(props: { title: string; actions?: ReactNode }) {
	const { title, actions } = props
	return (
		<div className="mt-4 mb-6 flex items-center justify-between">
			<h1 className="max-w-[70%] text-lg md:text-xl">{title}</h1>
			<div className={cn("flex flex-wrap gap-2")}>{actions}</div>
		</div>
	)
}
