import { OnlyFields } from "@zmaj-js/common"
// maybe return later NULLS_LAST/FIRST
type SortOptions = "ASC" | "DESC"
// | "ASC_NULLS_LAST"
// | "ASC_NULLS_FIRST"
// | "DESC_NULLS_LAST"
// | "DESC_NULLS_FIRST"

export type Sort<T> = Partial<Record<keyof OnlyFields<T>, SortOptions>>
