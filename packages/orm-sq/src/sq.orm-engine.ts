import { createOrmEngine } from "@zmaj-js/orm"
import { SequelizeService } from "./sq.service"

export const sqOrmEngine = createOrmEngine((params) => {
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
	}
})
