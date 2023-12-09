import { cn } from "@admin-panel/utils/cn"
import { clsx } from "clsx"
import { max, unique } from "radash"
import { useId } from "react"
import { Label } from "react-aria-components"
import {
	//
	MdChevronLeft,
	MdChevronRight,
	MdFirstPage,
	MdLastPage,
} from "react-icons/md"
import { IconButton } from "./buttons/IconButton"
import { SelectInput } from "./forms/SelectInput"
import { getLabelCss } from "./forms/forms-css"

export type PaginationProps = {
	total: number
	page: number
	setPage: (page: number) => void
	perPage: number
	setPerPage?: (val: number) => void
	perPageOptions?: readonly number[]
	hidePerPage?: boolean
	className?: string
}

export function Pagination(props: PaginationProps) {
	const { page, setPage } = props
	const totalPages = max([Math.ceil(props.total / props.perPage), 1])!

	return (
		<div
			className={clsx(
				"mb-2 mt-5 ml-auto flex  w-full items-center justify-end gap-x-2 self-end",
				props.className,
			)}
		>
			{props.hidePerPage !== true && (
				<PaginationPerPage
					current={props.perPage}
					options={unique([...(props.perPageOptions ?? []), props.perPage])}
					disabled={props.setPerPage === undefined}
					onChange={(v) => props.setPerPage?.(v)}
					// className="ml-8"
				/>
			)}

			<IconButton
				aria-label="First page"
				size="small"
				isDisabled={props.page === 1}
				onPress={() => setPage(1)}
			>
				<MdFirstPage />
			</IconButton>
			<IconButton
				aria-label="Previous page"
				size="small"
				isDisabled={props.page === 1}
				onPress={() => setPage(page - 1)}
			>
				<MdChevronLeft />
			</IconButton>
			<div className="center">
				<div className="min-w-[90px] text-center text-sm">
					{props.page} / {totalPages}
				</div>
			</div>

			<IconButton
				aria-label="Next page"
				size="small"
				isDisabled={totalPages === props.page}
				onPress={() => setPage(page + 1)}
			>
				<MdChevronRight />
			</IconButton>

			<IconButton
				aria-label="Last page"
				size="small"
				isDisabled={totalPages === props.page}
				onPress={() => setPage(totalPages)}
			>
				<MdLastPage />
			</IconButton>
		</div>
	)
}
type PerPageProps = {
	current: number
	options: number[]
	onChange: (val: number) => void
	disabled?: boolean
	className?: string
}

function PaginationPerPage(props: PerPageProps) {
	const id = useId()
	return (
		<div className={clsx("mr-4 flex gap-x-2 items-center", props.className)}>
			<Label htmlFor={id} className={cn(getLabelCss({}), "whitespace-nowrap")}>
				Per page
			</Label>
			{/* -mb remove description space */}
			<div className="-mb-4">
				<SelectInput
					aria-label="Per page"
					id={id}
					isRequired
					name="perPage"
					isDisabled={props.options.length === 0 || props.disabled}
					value={props.current}
					options={props.options.map((op) => ({ value: op }))} //
					onChange={(val) => props.onChange(val as number)}
				/>
			</div>
		</div>
	)
}
