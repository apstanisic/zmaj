import { ReturnedFields } from "@orm-engine/crud/returned-fields.type"
import { SelectFields } from "@orm-engine/crud/select-fields.type"
import { BaseModel } from "@orm-engine/model/base-model"
import { CreateParams } from "./create/CreateParams"
import { DeleteByIdParams } from "./delete/DeleteByIdParams"
import { DeleteManyParams } from "./delete/DeleteManyParams"
import { CountOptions } from "./find/CountOptions"
import { FindAndCountOptions } from "./find/FindAndCountOptions"
import { FindByIdOptions } from "./find/FindByIdOptions"
import { FindManyOptions } from "./find/FindManyOptions"
import { FindOneOptions } from "./find/FindOneOptions"
import { RawQueryOptions } from "./raw-query-options.type"
import { UpdateManyOptions } from "./update/UpdateManyOptions"
import { UpdateOneOptions } from "./update/UpdateOneOptions"

/**
 * Default fields to true since
 */

// export abstract class OrmRepository<T extends Record<string, any> = Record<string, unknown>> {
export abstract class OrmRepository<TModel extends BaseModel = BaseModel> {
	/**
	 * Execute raw query
	 * @param params
	 */
	abstract rawQuery(query: string, params?: RawQueryOptions): Promise<unknown>

	/**
	 * Find one record
	 * @param params
	 */
	abstract findOne<F extends SelectFields<TModel> | undefined = undefined>(
		params: FindOneOptions<TModel, F>,
	): Promise<ReturnedFields<TModel, F> | undefined>

	/**
	 * Find one record, or throw
	 * @param params
	 */
	abstract findOneOrThrow<F extends SelectFields<TModel> | undefined = undefined>(
		params: FindOneOptions<TModel, F>,
	): Promise<ReturnedFields<TModel, F>>

	/**
	 * Find with filter
	 * @param params
	 */
	abstract findWhere<F extends SelectFields<TModel> | undefined = undefined>(
		params: FindManyOptions<TModel, F>,
	): Promise<
		ReturnedFields<
			TModel,
			F,
			FindManyOptions<TModel, F>["includeHidden"] extends true ? true : false
		>[]
	>

	/**
	 * Find record with ID or throw
	 * @param params
	 */
	abstract findById<F extends SelectFields<TModel> | undefined = undefined>(
		params: FindByIdOptions<TModel, F>,
	): Promise<ReturnedFields<TModel, F>>
	/**
	 *
	 * @param params
	 */
	abstract findAndCount<F extends SelectFields<TModel> | undefined = undefined>(
		params: FindAndCountOptions<TModel, F>,
	): Promise<[ReturnedFields<TModel, F>[], number]>
	/**
	 *
	 * @param params
	 */
	abstract count(params: CountOptions<TModel>): Promise<number>
	/**
	 *
	 * @param params
	 */
	abstract createOne<OverrideCanCreate extends boolean = false>(
		params: CreateParams<TModel, OverrideCanCreate, "one">,
	): Promise<ReturnedFields<TModel, undefined>>
	/**
	 *
	 * @param params
	 */
	abstract createMany<OverrideCanCreate extends boolean = false>(
		params: CreateParams<TModel, OverrideCanCreate, "many">,
	): Promise<ReturnedFields<TModel, undefined>[]>
	/**
	 *
	 * @param params
	 */
	abstract updateById<OverrideCanUpdate extends boolean = false>(
		params: UpdateOneOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedFields<TModel, undefined>>

	/**
	 *
	 * @param params
	 */
	abstract updateWhere<OverrideCanUpdate extends boolean = false>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedFields<TModel, undefined>[]>
	/**
	 * Delete by Id
	 * @param params
	 */
	abstract deleteById(params: DeleteByIdParams<TModel>): Promise<ReturnedFields<TModel, undefined>>
	/**
	 * Delete where
	 * @param params
	 */
	abstract deleteWhere(
		params: DeleteManyParams<TModel>,
	): Promise<ReturnedFields<TModel, undefined>[]>
}
