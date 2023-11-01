import { Tooltip } from "@admin-panel/ui/Tooltip"
import { cn } from "@admin-panel/utils/cn"
import { isNil } from "@zmaj-js/common"
import { ReactElement, ReactNode } from "react"

type Props = {
	label?: string | ReactElement
	children: ReactNode
	description?: string | null
	className?: string
	actions?: ReactNode
	header?: ReactNode
}

/**
 * Card that is used as a wrapper component around show components so they all have uniform look
 * This is a low level component, and should not be used in most cases.
 * Try `DefaultShowField` instead.
 */
export function ShowFieldContainer(props: Props): JSX.Element {
	const content = isNil(props.children) ? (
		<div className="w-8 text-info">
			<Tooltip text="There is no value provided">-</Tooltip>
		</div>
	) : (
		props.children
	)
	return (
		<div
			className={cn(
				"du-card-bordered du-card rounded-xl border-opacity-50 px-2 py-1 shadow-sm",
				"max-h-[80vh] overflow-auto my-3",
				props.className,
			)}
		>
			{props.header ?? <ShowFieldContainerTitle {...props} />}
			<div className="flex min-h-[2rem] flex-col justify-items-stretch overflow-auto border-t border-gray-100 py-2 dark:border-gray-600">
				{content}
			</div>
		</div>
	)
}

function ShowFieldContainerTitle(props: Props): JSX.Element {
	const { label, description } = props

	return (
		<div className="flex w-full items-center justify-between">
			<Tooltip text={description ?? ""} side="top">
				<span className="my-0.5 min-h-[1.25rem] text-sm font-normal text-base-content/[0.7] ">
					{label}
				</span>
			</Tooltip>
			{props.actions}
		</div>
	)
}
