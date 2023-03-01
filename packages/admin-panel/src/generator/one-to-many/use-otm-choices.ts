import { useActionContext } from "@admin-panel/context/action-context"
import { useRelationContext } from "@admin-panel/context/relation-context"
import { useRecord } from "@admin-panel/hooks/use-record"
import { notNil } from "@zmaj-js/common"
import { PaginationPayload, SortPayload, useGetList, UseGetListHookValue } from "ra-core"
import { useMemo } from "react"

//   const [sort, setSort] = useState<SortPayload>({ field: "id", order: "ASC" })
//   const [userFilter, setUserFilter] = useState<Struct>({})
//   const [page, setPage] = useState(1)
//   const [perPage, setPerPage] = useState(10)
//   const relation = useRelationContext() ?? throwInApp("978378")
//   const action = useActionContext()
//   const record = useRecordContext()
//   //
//   const resource = relation.rightTable

//   const params = useToManyRequiredParams()
type Params = {
	enabled: boolean
	sort: SortPayload
	pagination: PaginationPayload
}

export function useOtmChoices(params: Params): UseGetListHookValue<any> {
	const { enabled, pagination, sort } = params
	const record = useRecord()
	const action = useActionContext()
	const relation = useRelationContext()!

	const fkField = relation.otherSide.fieldName

	const filter = useMemo(
		() =>
			action === "edit"
				? {
						$or: [
							{ [fkField]: { $eq: null } },
							{ [fkField]: { $ne: record?.id } }, //
						],
				  }
				: {},

		[action, fkField, record?.id],
	)

	// RA does some good things in this hook, that is not done in basic getList
	// like settings every record for detailed view to it's not empty
	return useGetList(
		relation.otherSide.collectionName,
		{
			sort,
			pagination,
			filter,
			meta: {
				otmFkField: fkField,
				otmShowForbidden: false,
			},
		},
		{
			enabled: enabled && (action === "create" ? true : notNil(record?.id)),
			keepPreviousData: true,
		},
	)
}
