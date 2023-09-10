import { BaseModel } from "@orm-engine/model/base-model"
import { RepoFilter } from "../filter/repo-filter.type"
import { SelectProperties } from "../select-properties/select-properties.type"
import { BaseFindOptions } from "./BaseFindOptions"
import { Sort } from "./Sort"

export type FindOneOptions<
	TModel extends BaseModel,
	TFields extends SelectProperties<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
	/**
	 * Order By
	 */
	orderBy?: Sort<TModel>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: RepoFilter<TModel>
}
