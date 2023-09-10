import { BaseModel } from "@orm-engine/model/base-model"
import { CreateParams } from "./create/CreateParams"
import { DeleteByIdParams } from "./delete/DeleteByIdParams"
import { DeleteManyParams } from "./delete/DeleteManyParams"
import { CountOptions } from "./find/CountOptions"
import { CursorPaginationResponse } from "./find/CursorPaginationResponse"
import { FindAndCountOptions } from "./find/FindAndCountOptions"
import { FindByIdOptions } from "./find/FindByIdOptions"
import { FindManyCursor } from "./find/FindManyCursor"
import { FindManyOptions } from "./find/FindManyOptions"
import { FindOneOptions } from "./find/FindOneOptions"
import { PaginatedResponse } from "./find/PaginationResponse"
import { RawQueryOptions } from "./raw-query-options.type"
import { ReturnedProperties } from "./return-properties/returned-properties.type"
import { SelectProperties } from "./select-properties/select-properties.type"
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
	abstract findOne<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden> | undefined>

	/**
	 * Find one record, or throw
	 * @param params
	 */
	abstract findOneOrThrow<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>>

	/**
	 * Find with filter
	 * @param params
	 */
	abstract findWhere<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>[]>

	/**
	 * Find record with ID or throw
	 * @param params
	 */
	abstract findById<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindByIdOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>>
	/**
	 *
	 * @param params
	 */
	abstract findAndCount<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindAndCountOptions<TModel, TFields, TIncludeHidden>,
	): Promise<[ReturnedProperties<TModel, TFields, TIncludeHidden>[], number]>
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
	): Promise<ReturnedProperties<TModel, undefined>>
	/**
	 *
	 * @param params
	 */
	abstract createMany<OverrideCanCreate extends boolean = false>(
		params: CreateParams<TModel, OverrideCanCreate, "many">,
	): Promise<ReturnedProperties<TModel, undefined>[]>
	/**
	 *
	 * @param params
	 */
	abstract updateById<OverrideCanUpdate extends boolean = false>(
		params: UpdateOneOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedProperties<TModel, undefined>>

	/**
	 *
	 * @param params
	 */
	abstract updateWhere<OverrideCanUpdate extends boolean = false>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedProperties<TModel, undefined>[]>
	/**
	 * Delete by Id
	 * @param params
	 */
	abstract deleteById(
		params: DeleteByIdParams<TModel>,
	): Promise<ReturnedProperties<TModel, undefined>>
	/**
	 * Delete where
	 * @param params
	 */
	abstract deleteWhere(
		params: DeleteManyParams<TModel>,
	): Promise<ReturnedProperties<TModel, undefined>[]>

	abstract paginate<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyOptions<TModel, TFields, TIncludeHidden>,
	): Promise<PaginatedResponse<ReturnedProperties<TModel, TFields, TIncludeHidden>>>

	abstract cursor<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyCursor<TModel, TFields, TIncludeHidden>,
	): Promise<CursorPaginationResponse<ReturnedProperties<TModel, TFields, TIncludeHidden>>>
}
