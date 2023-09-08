import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { RepoWhere } from "../repo-where.type"
import { BaseFindOptions } from "./BaseFindOptions"
import { Sort } from "./Sort"
/**
 * Both fields are required, but since we are using repo, repo will provide first param,
 * and typescript can in that case infer 2nd. So we can get full type safety without having
 * to specify types
 */
export type FindManyCursor<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
	/**
	 * Limit
	 */
	limit?: number
	/**
	 * Order By
	 */
	orderBy?: Sort<TModel>
	/**
	 * Where part. User can provide array of ids
	 */
	where?: RepoWhere<TModel>
	/**
	 * Cursor for pagination
	 */
	cursor?: string
}