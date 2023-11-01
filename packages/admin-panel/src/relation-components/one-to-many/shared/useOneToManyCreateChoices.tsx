import { Struct } from "@zmaj-js/common"
import { IdType } from "@zmaj-js/orm"
import { ChoicesContextValue, PaginationPayload, SortPayload, useGetList } from "ra-core"
import { useState } from "react"

type UseOneToManyCreateChoicesProps = {
	enabled?: boolean
	sort?: SortPayload
	pagination?: PaginationPayload
	reference: string
	target: string
	source: string
	selected: IdType[]
	filter?: Struct
}

export function useOneToManyCreateChoices(
	props: UseOneToManyCreateChoicesProps,
): ChoicesContextValue<any> {
	const [sort, setSort] = useState<SortPayload>(props.sort ?? { field: "id", order: "ASC" })
	const [pagination, setPagination] = useState<PaginationPayload>(
		props.pagination ?? { page: 1, perPage: 10 },
	)
	const [userFilter, setUserFilter] = useState<Struct>(props.filter ?? {})

	const list = useGetList(
		props.reference,
		{
			sort,
			pagination,
			filter: userFilter,
			meta: {
				otmFkField: props.target,
				otmShowForbidden: false,
			},
		},
		{
			enabled: props.enabled,
			keepPreviousData: true,
		},
	)

	return {
		page: pagination.page,
		perPage: pagination.perPage,
		setPerPage: (perPage) => setPagination((prev) => ({ page: prev.page, perPage })),
		setPage: (page) => setPagination((prev) => ({ page, perPage: prev.perPage })),
		sort,
		setSort,
		isLoading: list.isLoading,
		isFetching: list.isFetching,
		hasPreviousPage: pagination.page > 1,
		hasNextPage: list.pageInfo?.hasNextPage ?? false,
		refetch: list.refetch,
		resource: props.reference,
		total: list.total ?? list.data?.length ?? 0,
		source: props.source,
		filter: userFilter,
		setFilters: (filter) => setUserFilter(filter),
		availableChoices: list.data ?? [],
		allChoices: list.data ?? [],
		displayedFilters: [],
		hideFilter: () => {},
		showFilter: () => {},
		error: list.error?.message,
		isFromReference: true,
		selectedChoices: props.selected,
		filterValues: {},
	}
}
