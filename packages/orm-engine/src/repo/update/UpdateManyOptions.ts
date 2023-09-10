import { BaseModel } from "@orm-engine/model/base-model"
import { GetUpdateFields } from "@orm-engine/model/types/get-model-fields.types"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoFilter } from "../filter/repo-filter.type"

/**
 * Props that are passed to update many method
 */
export type UpdateManyOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	where: RepoFilter<TModel>
	changes: GetUpdateFields<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
