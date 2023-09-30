import { BaseModel } from "@orm/model/base-model"
import {
	FieldCreateForbiddenError,
	FieldUpdateForbiddenError,
	InternalOrmProblem,
	NoChangesProvidedError,
	RecordNotFoundError,
	ZmajOrmError,
} from "@orm/orm-errors"
import { PojoModel } from ".."
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
import { PaginateOptions } from "./find/PaginateOptions"
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
	constructor(protected pojoModel: PojoModel) {}
	/**
	 * Execute raw query
	 * @param params
	 */
	abstract rawQuery(query: string, params?: RawQueryOptions): Promise<unknown>

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
	abstract createMany<OverrideCanCreate extends boolean = false>(
		params: CreateParams<TModel, OverrideCanCreate, "many">,
	): Promise<ReturnedProperties<TModel, undefined>[]>

	/**
	 *
	 * @param params
	 */
	abstract updateWhere<OverrideCanUpdate extends boolean = false>(
		params: UpdateManyOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedProperties<TModel, undefined>[]>

	/**
	 * Delete where
	 * @param params
	 */
	abstract deleteWhere(
		params: DeleteManyParams<TModel>,
	): Promise<ReturnedProperties<TModel, undefined>[]>

	/**
	 * Find one record
	 * @param params
	 */
	async findOne<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden> | undefined> {
		const [item] = await this.findWhere({
			trx: params.trx,
			fields: params.fields,
			orderBy: params.orderBy,
			where: params.where,
			limit: 1,
			includeHidden: params.includeHidden,
		})
		return item
	}

	/**
	 * Find one record, or throw
	 * @param params
	 */
	async findOneOrThrow<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindOneOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>> {
		const item = await this.findOne(params)
		if (!item) throw new RecordNotFoundError(this.pojoModel.name)
		return item
		// return item ?? throw404(532125, emsg.recordNotFound)
	}
	/**
	 * Find record with ID or throw
	 * @param params
	 */
	async findById<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindByIdOptions<TModel, TFields, TIncludeHidden>,
	): Promise<ReturnedProperties<TModel, TFields, TIncludeHidden>> {
		const res = await this.findOneOrThrow({
			fields: params.fields,
			trx: params.trx,
			where: params.id,
			includeHidden: params.includeHidden,
		})
		return res
	}

	/**
	 *
	 * @param params
	 */
	/**
	 *
	 * @param params
	 */
	async createOne<OverrideCanCreate extends boolean = false>(
		params: CreateParams<TModel, OverrideCanCreate, "one">,
	): Promise<ReturnedProperties<TModel, undefined>> {
		if (typeof params.data !== "object" || Array.isArray(params.data)) {
			throw new ZmajOrmError("Data must be object")
		}
		const result = await this.createMany({ ...params, data: [params.data] })
		if (result.length !== 1) throw new InternalOrmProblem(39534) //throw500(39534)
		return result[0]!
	}

	/**
	 *
	 * @param params
	 */
	async updateById<OverrideCanUpdate extends boolean = false>(
		params: UpdateOneOptions<TModel, OverrideCanUpdate>,
	): Promise<ReturnedProperties<TModel, undefined>> {
		const [updated] = await this.updateWhere({
			trx: params.trx,
			changes: params.changes,
			where: params.id,
			overrideCanUpdate: params.overrideCanUpdate,
		})
		if (!updated) throw new RecordNotFoundError(this.pojoModel.name, params.id)
		return updated
	}
	/**
	 * Delete by Id
	 * @param params
	 */
	async deleteById(
		params: DeleteByIdParams<TModel>,
	): Promise<ReturnedProperties<TModel, undefined>> {
		const [deleted] = await this.deleteWhere({
			trx: params.trx,
			where: params.id,
		})
		if (!deleted) throw new RecordNotFoundError(this.pojoModel.name, params.id)
		return deleted
	}
	/**
	 *
	 * @param params
	 */
	async paginate<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: PaginateOptions<TModel, TFields, TIncludeHidden>,
	): Promise<PaginatedResponse<ReturnedProperties<TModel, TFields, TIncludeHidden>>> {
		const limit = params.limit ?? 20
		const page = params.page ?? 1
		let offset = (page - 1) * limit
		if (offset < 0) {
			offset = 0
		}
		// By fetching limit + 1, we can check if there is next page
		const [data, count] = await this.findAndCount({ ...params, limit: limit + 1, offset })
		// if data is same as limit, or less, that means that additional row wasn't fetched,
		// and we know it's a last page
		const isLast = data.length <= limit
		// if it's not last page, remove redundant row
		if (!isLast) {
			data.pop()
		}
		return {
			isFirst: page === 1,
			isLast,
			data,
			page,
			totalItems: count,
			totalPages: Math.ceil(count / limit),
		}
	}

	cursor<
		TFields extends SelectProperties<TModel> | undefined = undefined,
		TIncludeHidden extends boolean = false,
	>(
		params: FindManyCursor<TModel, TFields, TIncludeHidden>,
	): Promise<CursorPaginationResponse<ReturnedProperties<TModel, TFields, TIncludeHidden>>> {
		throw new ZmajOrmError("Not implemented")
	}

	protected parseCreateData(
		items: Record<string, unknown>[],
		overrideCanCreate?: boolean,
	): Record<string, unknown>[] {
		return items.map((item) => {
			const parsed: Record<string, unknown> = {}
			for (const [field, value] of Object.entries(item)) {
				// do not pass null values when creating record, since that replaces default value
				// idk why sequelize sends it. On update, it should work normally
				// Do not pass null value, it messes with default value
				if (value === null || value === undefined) continue
				// If overrideCanCreate, return every value
				// otherwise, throw an error that forbidden value is provided
				if (
					overrideCanCreate !== true &&
					this.pojoModel.fields[field]?.canCreate === false
				) {
					throw new FieldCreateForbiddenError(field)
				}
				parsed[field] = value
			}

			const now = new Date()

			if (this.pojoModel.createdAtField) {
				parsed[this.pojoModel.createdAtField] = now
			}

			if (this.pojoModel.updatedAtField) {
				parsed[this.pojoModel.updatedAtField] = now
			}

			return parsed
		})
	}

	protected parseUpdateData(
		changes: Record<string, unknown>,
		overrideCanUpdate?: boolean,
	): Record<string, unknown> {
		const parsed: Record<string, unknown> = {}
		for (const [field, value] of Object.entries(changes)) {
			if (value === null || value === undefined) continue
			if (overrideCanUpdate !== true && this.pojoModel.fields[field]?.canUpdate === false) {
				throw new FieldUpdateForbiddenError(field)
			}
			parsed[field] = value
		}

		// We throw an error if no data, since we provide feature with updatedAt, that will not be
		// activated if no change occur
		if (Object.keys(parsed).length === 0) {
			throw new NoChangesProvidedError(9090)
		}

		if (this.pojoModel.updatedAtField) {
			parsed[this.pojoModel.updatedAtField] = new Date()
		}

		return parsed
	}

	protected get pk(): string {
		return this.pojoModel.idField
	}
}
