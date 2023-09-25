import { BaseModel, Class, PojoModel, createOrmEngine } from "@zmaj-js/orm"
import { SequelizeService } from "./sq.service"

export const sqOrmEngine = createOrmEngine<SequelizeService>((params) => {
	const sq = new SequelizeService(params.config, console, params.models)
	const schemaInfo = sq.schemaInfo
	const alterSchema = sq.alterSchema
	const repoManager = sq.repoManager
	return {
		alterSchema,
		repoManager,
		schemaInfo,
		init: async () => sq.init(),
		destroy: async () => sq.onModuleDestroy(),
		updateModels: (models: (Class<BaseModel> | PojoModel)[]) => sq.generateModels(models),
		engineProvider: sq,
	}
})
