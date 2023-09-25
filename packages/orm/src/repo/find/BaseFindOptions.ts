import { BaseModel } from "@orm/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { SelectProperties } from "../select-properties/select-properties.type"

export type BaseFindOptions<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseRepoMethodParams & {
	/**
	 * Fields and relations that we need to get
	 */
	fields?: TFields extends undefined ? SelectProperties<TModel> : TFields

	/**
	 * Should we return fields that contain `canRead: false`
	 */

	includeHidden?: TIncludeHidden
}
