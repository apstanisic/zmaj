import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, qsStringify, Struct, UrlQuery } from "@zmaj-js/common"
import {
	BaseModel,
	GetCreateFields,
	GetReadFields,
	GetUpdateFields,
	IdType,
	RepoFilter,
} from "@zmaj-js/orm"
import { AxiosInstance } from "axios"
import { Except } from "type-fest"

export type CrudResponse<T> = {
	data: T
}

type Fields = {
	[key: string]: true | Fields
}

type Sort = Struct<"ASC" | "DESC">

type CrudParams<TModel extends BaseModel> = Partial<
	Except<UrlQuery, "filter" | "fields"> & { filter: RepoFilter<TModel>; fields: Fields }
>

// type ParamMap<T extends Struct = Struct> = {
//   T: T
//   UpdateDto: Partial<T>
//   CreateDto: Partial<T>
// }
// export class CrudClient<TParam extends ParamMap = ParamMap> {}

/**
 * Made so it fits easily to react-admin dataProvider
 */
export class CrudClient<
	TModel extends BaseModel = BaseModel,
	TRead = GetReadFields<TModel, true>,
	TCreateDto = Partial<GetCreateFields<TModel, true>>,
	TUpdateDto = Partial<GetUpdateFields<TModel, true>>,
> {
	readonly #resourcePath: string

	constructor(
		protected readonly http: AxiosInstance,
		collectionName: string, //
	) {
		this.#resourcePath =
			collectionName.startsWith("$") || collectionName.startsWith("/")
				? collectionName.substring(1)
				: `collections/${collectionName}`
	}

	private makePath(params: { id?: string | number; query?: string } = {}): string {
		const { id = "", query = "" } = params
		let pathBuilder = this.#resourcePath
		if (id !== "") pathBuilder += `/${id}`
		if (query.length > 0 && query.startsWith("?")) {
			pathBuilder += query
		} else if (query.length > 0) {
			pathBuilder += `?${query}`
		}
		return pathBuilder
		// const base = trim(`${this.#resourcePath}/${id.toString()}`, "/")
		// return `${base}?${query}`
	}

	/**
	 * If collection name starts with $, that is custom url, and only $ will be striped
	 * It's like this because we need to provide simple CRUD type for react-admin data provider
	 * So we can pass zmaj_files, even if files class exists
	 */
	// private get resourcePath(): string {
	//   if (this.collectionName.startsWith("$")) return this.collectionName.substring(1)
	//   return "collections/" + this.collectionName
	// }

	/**
	 *
	 * Get item by ID
	 * @param id Item ID
	 * @param fields Fields to be returned. Defaults to all
	 * @returns Item or Error result
	 */
	async getById({
		id,
		fields,
	}: {
		id: IdType
		fields?: CrudParams<TModel>["fields"]
	}): Promise<TRead> {
		const query = qsStringify({ fields })

		return this.http
			.get<{ data: TRead }>(this.makePath({ id, query }))
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * @TODO Implement schema creation
	 */
	async getMany(params: CrudParams<TModel> = {}): Promise<Data<TRead[]> & { count?: number }> {
		const query = qsStringify(params)

		const path = this.makePath({ query })

		return this.http
			.get<Data<TRead[]> & { count?: number }>(path)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async getOne(
		params: Except<CrudParams<TModel>, "count" | "limit" | "page">,
	): Promise<TRead | undefined> {
		return this.getMany({ ...params, count: false, limit: 1 }).then((r) => r.data.at(0))
	}

	async getAll(params: Except<CrudParams<TModel>, "page" | "count" | "limit">): Promise<TRead[]> {
		const items: TRead[] = []
		let page = 1
		let done = false
		while (!done) {
			const data = await this.getMany({ ...params, limit: 100, count: true, page })
			page += 1
			items.push(...data.data)
			if (data.data.length < 100) {
				done = true
			}
		}
		return items
	}

	/**
	 * Create new item
	 */
	async createOne({ data }: { data: TCreateDto }): Promise<TRead> {
		return this.http
			.post<Data<TRead>>(this.makePath({}), data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Update item by ID
	 */
	async updateById({ id, data }: { id: IdType; data: TUpdateDto }): Promise<TRead> {
		return this.http
			.put<Data<TRead>>(this.makePath({ id }), data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * This is needed for react-admin. It has to be rewritten in api
	 */
	async updateByIds({ data, ids }: { data: TUpdateDto; ids: IdType[] }): Promise<TRead[]> {
		// const query = qsStringify({ filter: { id: { $in: ids } } });

		const items: TRead[] = []
		// don't overwhelm server, and it fixes problem with locking table in transactions
		for (const id of ids) {
			const item = await this.updateById({ id, data })
			items.push(item)
		}
		return items
		// return this.http
		//   .put<CrudResponse<T[]>>(this.makePath({ query }), data)
		//   .then((r) => r.data.data)
		//   .catch(sdkThrow)
	}

	/**
	 * Delete item by id
	 */
	async deleteById({ id }: { id: IdType }): Promise<TRead> {
		return this.http
			.delete<Data<TRead>>(this.makePath({ id }))
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	async temp__deleteWhere({
		filter,
		idField,
	}: {
		filter: CrudParams<TModel>["filter"]
		idField?: string
	}): Promise<void> {
		const toDelete = await this.getAll({ filter })
		for (const item of toDelete) {
			await this.deleteById({ id: (item as any)[idField ?? "id"] })
		}
	}
}
