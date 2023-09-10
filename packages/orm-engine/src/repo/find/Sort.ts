import { BaseModel } from "@orm-engine/model/base-model"
import { GetModelFields } from "@orm-engine/model/types/extract-model-fields.types"

// maybe return later NULLS_LAST/FIRST
type SortOptions = "ASC" | "DESC"
// | "ASC_NULLS_LAST"
// | "ASC_NULLS_FIRST"
// | "DESC_NULLS_LAST"
// | "DESC_NULLS_FIRST"

export type Sort<TModel extends BaseModel> = Partial<
	Record<keyof GetModelFields<TModel>, SortOptions>
>
