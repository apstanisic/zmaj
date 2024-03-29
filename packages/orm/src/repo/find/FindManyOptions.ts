import { BaseModel } from "@orm/model/base-model"
import { RepoFilter } from "../filter/repo-filter.type"
import { SelectProperties } from "../select-properties/select-properties.type"
import { BaseFindOptions } from "./BaseFindOptions"
import { Sort } from "./Sort"
/**
 * Both fields are required, but since we are using repo, repo will provide first param,
 * and typescript can in that case infer 2nd. So we can get full type safety without having
 * to specify types
 */
export type FindManyOptions<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
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
	where?: RepoFilter<TModel>
}
