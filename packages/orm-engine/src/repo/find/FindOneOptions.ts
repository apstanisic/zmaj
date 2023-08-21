import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { RepoWhere } from "../repo-where.type"
import { BaseFindOptions } from "./BaseFindOptions"
import { Sort } from "./Sort"

export type FindOneOptions<
	TModel extends BaseModel,
	TFields extends SelectFields<TModel> | undefined,
	TIncludeHidden extends boolean,
> = BaseFindOptions<TModel, TFields, TIncludeHidden> & {
	/**
	 * Order By
	 */
	orderBy?: Sort<TModel>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: RepoWhere<TModel>
}
