import { BaseModel, IdType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
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
