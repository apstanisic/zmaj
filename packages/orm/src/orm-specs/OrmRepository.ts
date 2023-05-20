import { BaseModel, Fields, ModelType } from "@zmaj-js/orm-common"
import { RawQueryOptions } from "./RawQueryOptions"
import { CreateManyParams } from "./create/CreateManyParams"
import { CreateOneParams } from "./create/CreateOneParams"
import { DeleteByIdParams } from "./delete/DeleteByIdParams"
import { DeleteManyParams } from "./delete/DeleteManyParams"
import { CountOptions } from "./find/CountOptions"
import { FindAndCountOptions } from "./find/FindAndCountOptions"
import { FindByIdOptions } from "./find/FindByIdOptions"
import { FindManyOptions } from "./find/FindManyOptions"
import { FindOneOptions } from "./find/FindOneOptions"
import { ReturnedFields } from "./find/returned-fields"
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
	abstract findOne<F extends Fields<ModelType<TModel>> | undefined = undefined>(
		params: FindOneOptions<TModel, F>,
	): Promise<ReturnedFields<ModelType<TModel>, F> | undefined>

	/**
	 * Find one record, or throw
	 * @param params
	 */
	abstract findOneOrThrow<F extends Fields<ModelType<TModel>> | undefined = undefined>(
		params: FindOneOptions<TModel, F>,
	): Promise<ReturnedFields<ModelType<TModel>, F>>

	/**
	 * Find with filter
	 * @param params
	 */
	abstract findWhere<F extends Fields<ModelType<TModel>> | undefined = undefined>(
		params: FindManyOptions<TModel, F>,
	): Promise<ReturnedFields<ModelType<TModel>, F>[]>

	/**
	 * Find record with ID or throw
	 * @param params
	 */
	abstract findById<F extends Fields<ModelType<TModel>> | undefined = undefined>(
		params: FindByIdOptions<TModel, F>,
	): Promise<ReturnedFields<ModelType<TModel>, F>>
	/**
	 *
	 * @param params
	 */
	abstract findAndCount<F extends Fields<ModelType<TModel>> | undefined = undefined>(
		params: FindAndCountOptions<TModel, F>,
	): Promise<[ReturnedFields<ModelType<TModel>, F>[], number]>
	/**
	 *
	 * @param params
	 */
	abstract count(params: CountOptions<ModelType<TModel>>): Promise<number>
	/**
	 *
	 * @param params
	 */
	abstract createOne<OverrideCanCreate extends boolean = false>(
		params: CreateOneParams<TModel, OverrideCanCreate>,
	): Promise<ModelType<TModel>>
	/**
	 *
	 * @param params
	 */
	abstract createMany<OverrideCanCreate extends boolean = false>(
		params: CreateManyParams<TModel, OverrideCanCreate>,
	): Promise<ModelType<TModel>[]>
	/**
	 *
	 * @param params
	 */
	abstract updateById<OverrideCanUpdate extends boolean = false>(
		params: UpdateOneOptions<TModel, OverrideCanUpdate>,
	): Promise<ModelType<TModel>>

	/**
	 *
	 * @param params
	 */
	abstract updateWhere<OverrideCanUpdate extends boolean = false>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ModelType<TModel>[]>
	/**
	 * Delete by Id
	 * @param params
	 */
	abstract deleteById(params: DeleteByIdParams): Promise<ModelType<TModel>>
	/**
	 * Delete where
	 * @param params
	 */
	abstract deleteWhere(params: DeleteManyParams<ModelType<TModel>>): Promise<ModelType<TModel>[]>
}
