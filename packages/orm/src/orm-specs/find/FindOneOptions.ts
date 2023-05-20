import { BaseModel, Fields, Filter, IdType, ModelType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Sort } from "./Sort"

export type FindOneOptions<
	TModel extends BaseModel,
	F extends Fields<ModelType<TModel>> | undefined,
> = BaseRepoMethodParams & {
	/**
	 * Order By
	 */
	orderBy?: Sort<TModel>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: Filter<ModelType<TModel>> | IdType

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? Fields<ModelType<TModel>> : F
}
