import { BaseModel, Fields, Filter, IdType, ModelType } from "@zmaj-js/orm-common"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { Sort } from "./Sort"
/**
 * Both fields are required, but since we are using repo, repo will provide first param,
 * and typescript can in that case infer 2nd. So we can get full type safety without having
 * to specify types
 */
export type FindManyOptions<
	TModel extends BaseModel,
	F extends Fields<ModelType<TModel>> | undefined,
> = BaseRepoMethodParams & {
	/**
	 * Limit
	 */
	limit?: number
	/**
	 * Omit
	 */
	offset?: number
	/**
	 * Order By
	 */
	// orderBy?: QueryOrderMap<T>
	orderBy?: Sort<TModel>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: Filter<ModelType<TModel>> | IdType[] | IdType

	/**
	 * Fields and relations that we need to get
	 */
	fields?: F extends undefined ? Fields<ModelType<TModel>> : F
	/**
	 * @internal
	 * TODO
	 */
	includeHidden?: boolean
}
