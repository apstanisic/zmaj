import { Pagination, PaginationProps } from "@admin-panel/ui/Pagination"
import { useListContext } from "ra-core"
import { unique } from "radash"
import { useMemo } from "react"

export function ListPagination(
	props: Pick<PaginationProps, "perPageOptions" | "hidePerPage">,
): JSX.Element {
	const list = useListContext()

	const perPageOptions = useMemo(() => {
		const base = props.perPageOptions ?? [10, 20, 40]
		if (list.perPage) return unique([...base, list.perPage].sort())
		return base.toSorted()
	}, [list.perPage, props.perPageOptions])

	return (
		<Pagination
			className="self-end"
			page={list.page ?? 1}
			perPage={list.perPage ?? 10}
			setPage={list.setPage}
			total={list.total ?? 0}
			setPerPage={list.setPerPage}
			perPageOptions={perPageOptions}
			hidePerPage={props.hidePerPage}
		/>
	)
}
