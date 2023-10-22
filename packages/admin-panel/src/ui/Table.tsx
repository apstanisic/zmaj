import { cn } from "@admin-panel/utils/cn"
import { clsx } from "clsx"
import { memo } from "react"

export function Table({
	children,
	noBorder,
	...props
}: JSX.IntrinsicElements["table"] & { noBorder?: boolean }): JSX.Element {
	return (
		<div className={clsx(" w-full overflow-x-auto rounded-lg", noBorder !== true && "border")}>
			<table
				{...props}
				className={clsx(
					"w-full overflow-x-auto whitespace-nowrap  dark:text-white",
					props.className,
				)}
			>
				{children}
			</table>
		</div>
	)
	//
}

Table.Head = memo(
	({
		children,
		allSelected,
		...props
	}: JSX.IntrinsicElements["thead"] & { allSelected?: boolean }) => {
		return (
			<thead
				{...props}
				className={clsx(
					"h-10 max-h-10 border-b",
					allSelected ? "bg-base-300" : "bg-base-200",
					props.className,
				)}
			>
				{children}
			</thead>
		)
	},
)

Table.Body = memo(({ children, ...props }: JSX.IntrinsicElements["tbody"]) => {
	return (
		<tbody {...props} className={clsx("", props.className)}>
			{children}
		</tbody>
	)
})

Table.Footer = memo(({ children, ...props }: JSX.IntrinsicElements["tfoot"]) => {
	return (
		<tfoot {...props} className={clsx(props.className)}>
			{children}
		</tfoot>
	)
})

Table.HeaderRow = memo((props: JSX.IntrinsicElements["tr"]) => {
	return (
		<tr {...props} className={clsx("border-b bg-inherit", props.className)}>
			{props.children}
		</tr>
	)
})

Table.HeaderColumn = memo(({ children, ...props }: JSX.IntrinsicElements["th"]) => {
	return (
		<th
			{...props}
			className={clsx(
				"whitespace-nowrap bg-inherit px-3  py-2 text-sm font-medium",
				props.className,
			)}
		>
			{children}
		</th>
	)
})

Table.Row = memo(
	({
		children,
		selected,
		hover,

		...props
	}: JSX.IntrinsicElements["tr"] & { selected?: boolean; hover?: boolean }) => {
		return (
			<tr
				{...props}
				className={clsx(
					"border-b last:border-b-0 ",
					selected ? "bg-slate-100 dark:bg-gray-800" : "bg-base-100",
					hover && "hover:bg-blue-50 dark:hover:bg-gray-900",
					props.className,
				)}
			>
				{children}
			</tr>
		)
	},
)

Table.Column = memo(({ children, ...props }: JSX.IntrinsicElements["td"]) => {
	return (
		<td {...props} className={cn("whitespace-nowrap px-3 py-2  ", "text-sm", props.className)}>
			{children}
		</td>
	)
})
