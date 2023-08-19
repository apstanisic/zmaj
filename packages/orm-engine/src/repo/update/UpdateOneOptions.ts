import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { IdType } from "../id-type.type"
import { GetUpdateType } from "./GetUpdateType"

/**
 * Props that are passed to update one method
 */
export type UpdateOneOptions<
	TModel extends BaseModel,
	OverrideCanUpdate extends boolean,
> = BaseRepoMethodParams & {
	id: IdType
	changes: GetUpdateType<TModel, OverrideCanUpdate>
	overrideCanUpdate?: OverrideCanUpdate
}
