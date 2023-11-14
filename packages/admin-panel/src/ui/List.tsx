import { cn } from "@admin-panel/utils/cn"
import { isNil } from "@zmaj-js/common"
import { ComponentProps, Fragment, ReactNode } from "react"
import { Button, ButtonProps } from "react-aria-components"
import { Link, LinkProps } from "react-router-dom"

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
				"w-full items-center",
				"flex w-full flex-row",
				noPadding !== true && "py-2 px-1",
				hover && "hover:bg-base-200",
				rest.className,
			)}
		>
			{start && <div className="mr-2 flex">{start}</div>}
			{/* <div className="flex-grow">{rest.children}</div> */}
			{rest.children}
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

List.TitleAndSub = (props: { title: ReactNode; subtitle?: string }) => {
	return (
		<div className="overflow-hidden">
			{typeof props.title === "string" ? <p className="">{props.title}</p> : props.title}
			{props.subtitle && <p className="text-sm opacity-75">{props.subtitle}</p>}
		</div>
	)
}

export function ListV2<T = any>(props: {
	divider?: boolean
	className?: string
	items?: T[] | null
	render: (item: T) => ReactNode
	getKey: (item: T) => string | number
	empty?: ReactNode
}) {
	const { divider, className, getKey, render, empty, items } = props
	if (isNil(items) && empty) return empty
	return (
		<ul className={cn("", className, divider && "divide-y")}>
			{items?.map((item) => <Fragment key={getKey(item)}>{render(item)}</Fragment>)}
		</ul>
	)
}

export function ListItem(props: ComponentProps<"li"> & { start?: ReactNode; end?: ReactNode }) {
	const { start, end, children, className, ...rest } = props
	return (
		<li {...rest} className={cn("flex items-center gap-x-3 py-3", className)}>
			{start}
			{children}
			{end}
		</li>
	)
}

export function ListItemButton(
	props: Omit<ButtonProps, "children"> & {
		start?: ReactNode
		end?: ReactNode
		children: ReactNode
	},
) {
	const { start, end, children, className, ...rest } = props
	return (
		<li>
			<Button
				{...rest}
				className={({ isHovered, isDisabled }) =>
					cn(
						"w-full flex items-center gap-x-3 py-3 px-2",
						isHovered && "bg-base-200",
						isDisabled && "text-neutral",
						className,
					)
				}
			>
				{start}
				{children}
				<div className="ml-auto">{end}</div>
			</Button>
		</li>
	)
}

export function ListItemLink(props: LinkProps & { start?: ReactNode; end?: ReactNode }) {
	const { start, end, children, className, ...rest } = props
	return (
		<li>
			<Link {...rest} className={cn("w-dull flex items-center gap-x-3 py-3", className)}>
				{start}
				{children}
				{end}
			</Link>
		</li>
	)
}
