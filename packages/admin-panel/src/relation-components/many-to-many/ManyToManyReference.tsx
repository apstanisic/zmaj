import { useRecord } from "@admin-panel/hooks/use-record"
import {
	ListContextProvider,
	ResourceContextProvider,
	UseListValue,
	useGetList,
	useGetMany,
} from "ra-core"
import { ReactNode, useMemo, useState } from "react"

export type ManyToManyReferenceProps = {
	reference: string
	trough: string
	troughSource: string
	troughTarget: string
	children?: ReactNode
}
export function ManyToManyReference(props: ManyToManyReferenceProps) {
	const { reference, trough, troughSource, troughTarget } = props
	const [page, setPage] = useState(1)
	const [perPage, setPerPage] = useState(5)

	const id = useRecord()?.id
	const junction = useGetList(
		trough,
		{ filter: { [troughSource]: id }, pagination: { page, perPage } },
		{ enabled: !!id },
	)

	const items = useGetMany(
		reference,
		{ ids: junction.data?.map((item) => item[troughTarget]) },
		{ enabled: junction.data && junction.data.length > 0 },
	)

	const listData: UseListValue = useMemo(() => {
		return {
			data: items.data ?? [],
			displayedFilters: {},
			filterValues: {},
			hasNextPage: junction.pageInfo?.hasNextPage ?? false,
			hasPreviousPage: junction.pageInfo?.hasPreviousPage ?? false,
			isLoading: junction.isLoading || items.isLoading,
			isFetching: junction.isFetching || items.isFetching,
			page,
			perPage,
			setPerPage,
			setPage,
			hideFilter: () => {},
			onSelect: () => {},
			onToggleItem: () => {},
			onUnselectItems() {},
			refetch: items.refetch,
			resource: reference,
			selectedIds: [],
			setFilters() {},
			setSort(sort) {},
			showFilter(filterName, defaultValue) {},
			total: junction.total ?? junction.data?.length ?? 0,
			error: junction.error ?? items.error,
			sort: { field: "id", order: "ASC" },
		}
	}, [items, junction, page, perPage, reference])

	return (
		<ResourceContextProvider value={reference}>
			<ListContextProvider value={listData}>{props.children}</ListContextProvider>
		</ResourceContextProvider>
	)
}
