import { useActionContext } from "@admin-panel/context/action-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { notNil, ToManyChange, UrlQuery } from "@zmaj-js/common"
import {
	PaginationPayload,
	SortPayload,
	useGetList,
	UseGetListHookValue,
	useResourceDefinition,
} from "ra-core"
import { useMemo } from "react"
import { useWatch } from "react-hook-form"
import { getEmptyToManyChanges } from "../one-to-many/getEmptyToManyChanges"

type Params = {
	enabled: boolean
	sort: SortPayload
	pagination: PaginationPayload
	source: string
	reference: string
}

export function useMtmChoices(params: Params): UseGetListHookValue<any> {
	const { enabled, pagination, sort } = params
	const record = useRecord()
	const action = useActionContext()
	const resource = useResourceDefinition()
	const changes = useWatch({
		name: params.source,
		defaultValue: getEmptyToManyChanges(),
	}) as ToManyChange

	const filter = useMemo(
		() => ({ id: { $nin: changes.added } }), //
		[changes.added],
	)

	// RA does some good things in this hook, that is not done in basic getList
	// like settings every record for detailed view to it's not empty
	return useGetList(
		params.reference,
		{
			pagination,
			sort,
			filter,
			meta: <Partial<UrlQuery>>{
				mtmCollection: resource.name,
				mtmProperty: params.source,
				mtmRecordId: record?.id,
			},
		},
		{
			enabled: enabled && (action === "create" ? true : notNil(record?.id)),
			keepPreviousData: true,
		},
	)
}
