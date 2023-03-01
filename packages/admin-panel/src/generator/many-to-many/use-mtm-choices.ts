import { useActionContext } from "@admin-panel/context/action-context"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { useToManyInputContext } from "@admin-panel/context/to-many-input-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { notNil, UrlQuery } from "@zmaj-js/common"
import { PaginationPayload, SortPayload, useGetList, UseGetListHookValue } from "ra-core"
import { useMemo } from "react"

type Params = {
	enabled: boolean
	sort: SortPayload
	pagination: PaginationPayload
}

export function useMtmChoices(params: Params): UseGetListHookValue<any> {
	const { enabled, pagination, sort } = params
	const { changes } = useToManyInputContext()
	const record = useRecord()
	const action = useActionContext()
	const relation = useRelationContext()!

	const filter = useMemo(
		() =>
			action === "edit"
				? {
						id: { $nin: changes.value.added },
				  }
				: {},

		[action, changes.value.added],
	)

	// RA does some good things in this hook, that is not done in basic getList
	// like settings every record for detailed view to it's not empty
	return useGetList(
		relation.otherSide.collectionName,
		{
			pagination,
			sort,
			filter,
			meta: <Partial<UrlQuery>>{
				mtmCollection: relation.collectionName,
				mtmProperty: relation.propertyName,
				mtmRecordId: record?.id,
			},
		},
		{
			enabled: enabled && (action === "create" ? true : notNil(record?.id)),
			keepPreviousData: true,
		},
	)
}
