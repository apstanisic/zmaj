import { BaseModel } from "@zmaj-js/orm-common"
// maybe return later NULLS_LAST/FIRST
type SortOptions = "ASC" | "DESC"
// | "ASC_NULLS_LAST"
// | "ASC_NULLS_FIRST"
// | "DESC_NULLS_LAST"
// | "DESC_NULLS_FIRST"

export type Sort<TModel extends BaseModel> = Partial<Record<keyof TModel["fields"], SortOptions>>
