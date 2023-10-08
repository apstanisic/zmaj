import {
	BaseModel,
	ModelsState,
	OrmRepository,
	PojoModel,
	RepoManager,
	UndefinedModelError,
} from "@zmaj-js/orm"
import { literal } from "sequelize"
import { SequelizeRepository } from "./sq.repository"
import { SequelizeService } from "./sq.service"

/**
 * Clearing not implemented????
 */
export class SequelizeRepoManager extends RepoManager {
	constructor(
		private sq: SequelizeService,
		models: ModelsState,
	) {
		super(models)
	}

	protected override createRepo(model: PojoModel): OrmRepository<BaseModel> {
		const sqModelExist = this.sq.sqModels[model.name]
		if (!sqModelExist) throw new UndefinedModelError(model.name)

		return new SequelizeRepository(this.sq, model)
	}

	unescaped(sql: string): ReturnType<typeof literal> {
		return literal(sql)
	}
}
