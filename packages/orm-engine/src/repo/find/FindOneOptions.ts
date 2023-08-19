import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { BaseRepoMethodParams } from "../BaseRepoMethodParams"
import { RepoWhere } from "../repo-where.type"
import { Sort } from "./Sort"

export type FindOneOptions<
	TModel extends BaseModel,
	F extends SelectFields<TModel> | undefined,
> = BaseRepoMethodParams & {
	/**
	 * Order By
	 */
	orderBy?: Sort<TModel>

	/**
	 * Where part. User can provide array of ids
	 */
	where?: RepoWhere<TModel>

	/**
	 * Fields that user wants
	 */
	fields?: F extends undefined ? SelectFields<TModel> : F
}
