import { qsStringify, Struct } from "@zmaj-js/common"

type RaQuery = {
	filter?: Struct
	order?: "ASC" | "DESC"
	page?: number
	perPage?: number
	sort?: string
}
/**
 * @deprecated
 */
export function toRaQuery(query: RaQuery): string {
	const filter = query.filter ? JSON.stringify(query.filter) : {}
	return qsStringify({ ...query, filter })
}
