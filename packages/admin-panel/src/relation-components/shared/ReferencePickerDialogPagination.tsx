import { Pagination } from "@admin-panel/ui/Pagination"
import { useChoicesContext } from "ra-core"
import { isInt } from "radash"

export function ReferencePickerDialogPagination() {
	const choices = useChoicesContext()

	return (
		<Pagination
			page={isInt(choices.page) ? choices.page : 1}
			perPage={choices.perPage}
			total={choices.total ?? 0}
			hidePerPage
			setPage={(p) => choices.setPage(p)}
		/>
	)
}
