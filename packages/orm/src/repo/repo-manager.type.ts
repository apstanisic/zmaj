import { BaseModel } from "@orm/model/base-model"
import { Class } from "type-fest"
import { ModelsState, PojoModel } from ".."
import { OrmRepository } from "./OrmRepository"

export abstract class RepoManager {
	constructor(protected modelsState: ModelsState) {}
	protected repositories: Record<string, OrmRepository<any>> = {}

	/**
	 * Get ORM repository
	 * @param model Provide either model name or model
	 */
	getRepo<TModel extends BaseModel = BaseModel>(
		model: Class<TModel> | string,
	): OrmRepository<TModel> {
		const name = typeof model === "string" ? model : this.modelsState.getOneAsPojo(model).name

		const repo = this.repositories[name]
		if (repo) return repo as OrmRepository<TModel>

		const pojoModel = this.modelsState.getByNameAsPojo(name)

		const created = this.createRepo(pojoModel)
		this.repositories[name] = created as OrmRepository<any>
		return created as OrmRepository<TModel>
	}

	reset(): void {
		this.repositories = {}
	}

	protected abstract createRepo(model: PojoModel): OrmRepository
}
