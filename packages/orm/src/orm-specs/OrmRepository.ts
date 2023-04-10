import { Fields, Struct } from "@zmaj-js/common"
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
import { RawQueryOptions } from "./RawQueryOptions"
import { UpdateManyOptions } from "./update/UpdateManyOptions"
import { UpdateOneOptions } from "./update/UpdateOneOptions"

/**
 * Default fields to true since
 */
export abstract class OrmRepository<T extends Struct<any> = Record<string, unknown>> {
	/**
	 * Execute raw query
	 * @param params
	 */
	abstract rawQuery(query: string, params?: RawQueryOptions): Promise<unknown>

	/**
	 * Find one record
	 * @param params
	 */
	abstract findOne<F extends Fields<T> | undefined = undefined>(
		params: FindOneOptions<T, F>,
	): Promise<ReturnedFields<T, F> | undefined>

	/**
	 * Find one record, or throw
	 * @param params
	 */
	abstract findOneOrThrow<F extends Fields<T> | undefined = undefined>(
		params: FindOneOptions<T, F>,
	): Promise<ReturnedFields<T, F>>

	/**
	 * Find with filter
	 * @param params
	 */
	abstract findWhere<F extends Fields<T> | undefined = undefined>(
		params: FindManyOptions<T, F>,
	): Promise<ReturnedFields<T, F>[]>

	/**
	 * Find record with ID or throw
	 * @param params
	 */
	abstract findById<F extends Fields<T> | undefined = undefined>(
		params: FindByIdOptions<T, F>,
	): Promise<ReturnedFields<T, F>>
	/**
	 *
	 * @param params
	 */
	abstract findAndCount<F extends Fields<T> | undefined = undefined>(
		params: FindAndCountOptions<T, F>,
	): Promise<[ReturnedFields<T, F>[], number]>
	/**
	 *
	 * @param params
	 */
	abstract count(params: CountOptions<T>): Promise<number>
	/**
	 *
	 * @param params
	 */
	abstract createOne(params: CreateOneParams<T>): Promise<T>
	/**
	 *
	 * @param params
	 */
	abstract createMany(params: CreateManyParams<T>): Promise<T[]>
	/**
	 *
	 * @param params
	 */
	abstract updateById(params: UpdateOneOptions<T>): Promise<T>

	/**
	 *
	 * @param params
	 */
	abstract updateWhere(params: UpdateManyOptions<T>): Promise<T[]>
	/**
	 * Delete by Id
	 * @param params
	 */
	abstract deleteById(params: DeleteByIdParams): Promise<T>
	/**
	 * Delete where
	 * @param params
	 */
	abstract deleteWhere(params: DeleteManyParams<T>): Promise<T[]>
}
