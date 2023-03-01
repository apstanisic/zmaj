import { useMtmChoices } from "@admin-panel/generator/many-to-many/use-mtm-choices"
import { useOtmChoices } from "@admin-panel/generator/one-to-many/use-otm-choices"
import { Struct } from "@zmaj-js/common"
import { ChoicesContextProvider, SortPayload } from "ra-core"
import { memo, useState } from "react"
import { useRelationContext } from "../../../context/relation-context"
import { throwInApp } from "../../../shared/throwInApp"
import { OnlyChildren } from "../../../types/OnlyChildren"

const doNothing = (): void => {}

export const ToManyChoicesContext = memo((props: OnlyChildren) => {
	const [sort, setSort] = useState<SortPayload>({ field: "id", order: "ASC" })
	const [userFilter, setUserFilter] = useState<Struct>({})
	const [page, setPage] = useState(1)
	const [perPage, setPerPage] = useState(10)
	const relation = useRelationContext() ?? throwInApp("978378")
	// const action = useActionContext()
	// const record = useRecordContext()
	//
	const resource = relation.otherSide.tableName

	const otmResult = useOtmChoices({
		enabled: relation.type === "one-to-many",
		sort,
		pagination: { page, perPage },
	})

	const mtmResult = useMtmChoices({
		enabled: relation.type === "many-to-many",
		sort,
		pagination: { page, perPage },
	})

	const result = relation.type === "many-to-many" ? mtmResult : otmResult

	return (
		<ChoicesContextProvider
			value={{
				sort,
				setSort,
				resource,
				page,
				setPage,
				perPage,
				setPerPage,
				isFetching: result.isFetching,
				isLoading: result.isLoading,
				total: result.total ?? 0,
				refetch: () => void result.refetch(),
				hasPreviousPage: result.pageInfo?.hasPreviousPage ?? page === 1,
				hasNextPage: result.pageInfo?.hasNextPage ?? false,
				// diff between all choices and available choices is that all choices includes
				// currently selected items, but we can't do this here, cause we don't have all selected
				// items
				allChoices: result.data ?? [],
				availableChoices: result.data ?? [],
				// we don't have access to selected choices, since relation could have 1000s records
				// and we don't want to fetch all that records
				selectedChoices: [],
				// selectedChoices: undefined as any,
				// which property
				source: relation.propertyName,
				// permanent filter (used to fetch only relevant data)
				// filter: params.filter,
				// there is currently no need to show or hide filters (does not exist in ui)
				hideFilter: doNothing,
				showFilter: doNothing,
				displayedFilters: [],
				// User filters (not used in gui, but implemented)
				setFilters: (filter) => setUserFilter(filter),
				filterValues: userFilter,
				//
				error: result.error,
				isFromReference: true, // i do not know what this does, there are no docs for this
			}}
		>
			{props.children}
		</ChoicesContextProvider>
	)
})
