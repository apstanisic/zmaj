import { BaseModel } from "@orm-engine/model/base-model"
import { GetUpdateFields } from "@orm-engine/model/types/get-model-fields.types"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { IdType } from "../id-type.type"

/**
 * Props that are passed to update one method
 */
export type UpdateOneOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	id: IdType
	changes: GetUpdateFields<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
