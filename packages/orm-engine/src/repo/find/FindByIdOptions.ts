import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { IdType } from "../id-type.type"
import { BaseFindOptions } from "./BaseFindOptions"
export type FindByIdOptions<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
	/**
	 * Filter
	 */
	id: IdType
}
