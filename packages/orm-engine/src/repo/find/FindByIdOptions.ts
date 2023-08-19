import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { IdType } from "../id-type.type"
export type FindByIdOptions<
	T extends BaseModel,
	F extends SelectFields<T> | undefined,
> = BaseRepoMethodParams & {
	/**
	 * Filter
	 */
	id: IdType

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? SelectFields<T> : F
}
