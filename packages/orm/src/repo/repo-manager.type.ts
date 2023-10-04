import { BaseModel } from "@orm/model/base-model"
import { Class } from "type-fest"
import { OrmRepository } from "./OrmRepository"

export abstract class RepoManager {
	protected abstract repositories: Record<string, OrmRepository<any>>

	/**
	 * Get ORM repository
	 * @param model Provide either model name or model
	 */
	abstract getRepo<TModel extends BaseModel = BaseModel>(
		model: Class<TModel> | string,
	): OrmRepository<TModel>

	// abstract getOrm<T = unknown>(): T
	abstract getOrm(): unknown

	// abstract unescaped(val: string): string
}
