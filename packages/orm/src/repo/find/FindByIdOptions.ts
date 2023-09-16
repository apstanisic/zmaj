import { BaseModel } from "@orm/model/base-model"
import { IdType } from "../id-type.type"
import { SelectProperties } from "../select-properties/select-properties.type"
import { BaseFindOptions } from "./BaseFindOptions"
export type FindByIdOptions<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
	/**
	 * Filter
	 */
	id: IdType
}
