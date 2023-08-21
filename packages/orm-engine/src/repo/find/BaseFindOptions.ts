import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"

export type BaseFindOptions<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseRepoMethodParams & {
	/**
	 * Fields and relations that we need to get
	 */
	fields?: TFields extends undefined ? SelectFields<TModel> : TFields

	/**
	 * Should we return fields that contain `canRead: false`
	 */

	includeHidden?: TIncludeHidden
}
