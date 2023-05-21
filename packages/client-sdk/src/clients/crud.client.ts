import { sdkThrow } from "@client-sdk/errors/error-utils"
import { Data, qsStringify, Struct, UrlQuery } from "@zmaj-js/common"
import { Filter, IdType } from "@zmaj-js/orm-common"
import { AxiosInstance } from "axios"
import { Except } from "type-fest"
import { ClientDto } from "./client-dto.type"

export type CrudResponse<T> = {
	data: T
}

type Fields = {
	[key: string]: true | Fields
}

type Sort = Struct<"ASC" | "DESC">

type CrudParams<T> = Partial<
	Except<UrlQuery, "filter" | "fields"> & { filter: Filter<T>; fields: Fields }
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
	T extends Struct = Struct,
	CreateDto = ClientDto<T>,
	UpdateDto = ClientDto<T>,
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
	async getById({ id, fields }: { id: IdType; fields?: CrudParams<T>["fields"] }): Promise<T> {
		const query = qsStringify({ fields })

		return this.http
			.get<{ data: T }>(this.makePath({ id, query }))
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * @TODO Implement schema creation
	 */
	async getMany(params: CrudParams<T> = {}): Promise<Data<T[]> & { count?: number }> {
		const query = qsStringify(params)

		const path = this.makePath({ query })

		return this.http
			.get<Data<T[]> & { count?: number }>(path)
			.then((r) => r.data)
			.catch(sdkThrow)
	}

	async getOne(params: Except<CrudParams<T>, "count" | "limit" | "page">): Promise<T | undefined> {
		return this.getMany({ ...params, count: false, limit: 1 }).then((r) => r.data.at(0))
	}

	async getAll(params: Except<CrudParams<T>, "page" | "count" | "limit">): Promise<T[]> {
		const items: T[] = []
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
	async createOne({ data }: { data: CreateDto }): Promise<T> {
		return this.http
			.post<Data<T>>(this.makePath({}), data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * Update item by ID
	 */
	async updateById({ id, data }: { id: IdType; data: UpdateDto }): Promise<T> {
		return this.http
			.put<Data<T>>(this.makePath({ id }), data)
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	/**
	 * This is needed for react-admin. It has to be rewritten in api
	 */
	async updateByIds({ data, ids }: { data: UpdateDto; ids: IdType[] }): Promise<T[]> {
		// const query = qsStringify({ filter: { id: { $in: ids } } });

		const items: T[] = []
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
	async deleteById({ id }: { id: IdType }): Promise<T> {
		return this.http
			.delete<Data<T>>(this.makePath({ id }))
			.then((r) => r.data.data)
			.catch(sdkThrow)
	}

	async temp__deleteWhere({
		filter,
		idField,
	}: {
		filter: CrudParams<T>["filter"]
		idField?: string
	}): Promise<void> {
		const toDelete = await this.getAll({ filter })
		for (const item of toDelete) {
			await this.deleteById({ id: item[idField ?? "id"] as any })
		}
	}
}
