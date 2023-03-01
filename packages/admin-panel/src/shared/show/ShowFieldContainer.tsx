import { Tooltip } from "@admin-panel/ui/Tooltip"
import { clsx } from "clsx"
import { ReactElement, ReactNode } from "react"

type Props = {
	label: string | ReactElement
	children: ReactNode
	description?: string | null
	className?: string
	actions?: ReactNode
}

/**
 * Card that is used as a wrapper component around show components so they all have uniform look
 * This is a low level component, and should not be used in most cases.
 * Try `DefaultShowField` instead.
 */
export function ShowFieldContainer(props: Props): JSX.Element {
	return (
		<div
			className={clsx(
				// "flex max-h-[80vh] w-full flex-col overflow-auto rounded-lg border-2 border-gray-50 py-1 px-2 shadow-lg shadow-gray-100  dark:border-neutral-800 dark:shadow-none",
				// show overflow, since it's hiding tooltip
				"du-card-bordered du-card rounded-xl border-opacity-50 px-2 py-1 shadow-sm",
				"max-h-[80vh] overflow-auto",
				props.className,
			)}
		>
			<Title {...props} />
			<div className="flex min-h-[2rem] flex-col justify-items-stretch overflow-auto border-t border-gray-100 py-2 dark:border-gray-600">
				{props.children}
			</div>
		</div>
	)
}

function Title(props: Props): JSX.Element {
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
