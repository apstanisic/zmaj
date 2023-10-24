import { cn } from "@admin-panel/utils/cn"
import { ReactNode } from "react"

export function List(props: JSX.IntrinsicElements["ul"] & { divider?: boolean }): JSX.Element {
	const { divider, className, children, ...rest } = props
	return (
		<ul {...rest} className={cn("", className, divider && "divide-y")}>
			{children}
		</ul>
	)
}

List.Item = (
	props: JSX.IntrinsicElements["li"] & {
		// active?: boolean
		// disabled?: boolean
		end?: ReactNode
		start?: ReactNode
		noPadding?: boolean
		hover?: boolean
		// href?: string
		// secondary?: ReactNode
	},
) => {
	const { noPadding, end, start, hover, ...rest } = props
	return (
		<li
			{...rest}
			className={cn(
				// "du-menu-item ",
				// active && "du-active", //
				// disabled && "du-disabled", //
				"items-center",
				"flex w-full flex-row",
				noPadding !== true && "py-2 px-1",
				hover && "hover:bg-base-200",
				rest.className,
			)}
		>
			{start && <div className="mr-2 flex">{start}</div>}
			<div className="flex-grow">{rest.children}</div>
			{end && <div className="ml-auto flex p-0">{end}</div>}
		</li>
	)
}

List.ButtonItem = (
	props: JSX.IntrinsicElements["button"] &
		JSX.IntrinsicElements["a"] & {
			// active?: boolean
			// disabled?: boolean
			end?: ReactNode
			start?: ReactNode
			noPadding?: boolean
			href?: string
		},
) => {
	const { noPadding, end, start, ...rest } = props
	const Component = props.href ? "a" : "button"
	return (
		<li>
			<Component
				{...rest}
				className={cn(
					// "du-menu-item ",
					// active && "du-active", //
					// disabled && "du-disabled", //
					"w-full items-center",
					"flex min-w-full flex-row text-left",
					noPadding !== true && "py-3 px-2",
					"hover:bg-base-200",
					rest.className,
				)}
			>
				{start && <div className="mr-2">{start}</div>}
				{/* <div className="flex-grow">{}</div> */}
				{rest.children}
				{end && <div className="ml-auto p-0">{end}</div>}
			</Component>
		</li>
	)
}

List.TitleAndSub = (props: { title: string; subtitle?: string }) => {
	return (
		<div>
			<p className="">{props.title}</p>
			<p className="text-sm opacity-75">{props.subtitle}</p>
		</div>
	)
}
