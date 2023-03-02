import { clsx } from "clsx"
import { max, unique } from "radash"
import {
	//
	MdChevronLeft,
	MdChevronRight,
	MdFirstPage,
	MdLastPage,
} from "react-icons/md"
import { IconButton } from "./IconButton"
import { Select } from "./Select"

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

export function Pagination(props: PaginationProps): JSX.Element {
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

			<IconButton label="First page" disabled={props.page === 1} onClick={() => setPage(1)}>
				<MdFirstPage />
			</IconButton>
			<IconButton
				label="Previous page"
				disabled={props.page === 1}
				onClick={() => setPage(page - 1)}
			>
				<MdChevronLeft />
			</IconButton>
			<div className="center">
				<div className="min-w-[90px] text-center text-sm">
					{props.page} / {totalPages}
				</div>
			</div>

			<IconButton
				label="Next page"
				disabled={totalPages === props.page}
				onClick={() => setPage(page + 1)}
			>
				<MdChevronRight />
			</IconButton>

			<IconButton
				label="Last page"
				disabled={totalPages === props.page}
				onClick={() => setPage(totalPages)}
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

function PaginationPerPage(props: PerPageProps): JSX.Element {
	return (
		<div className={clsx("mr-4", props.className)}>
			<Select
				// hideHelperText
				required
				// hideAsterisk
				labelPosition="right"
				label="Per Page"
				// buttonClassName="p-1"
				buttonProps={{ className: "py-1 !h-10" }}
				className="!flex-row-reverse items-center"
				// className="h-8 w-40"
				name="perPage"
				hideRequiredSign
				disabled={props.options.length === 0 || props.disabled}
				value={props.current}
				choices={props.options.map((op) => ({ value: op }))} //
				onChange={(val: number) => props.onChange(val)}
			/>
		</div>
	)
}
