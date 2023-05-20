import { BaseModel, Fields, IdType, ModelType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
export type FindByIdOptions<
	T extends BaseModel,
	F extends Fields<ModelType<T>> | undefined,
> = BaseRepoMethodParams & {
	/**
	 * Filter
	 */
	id: IdType

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? Fields<ModelType<T>> : F
}
