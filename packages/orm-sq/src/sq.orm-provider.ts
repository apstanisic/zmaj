import { OrmProvider } from "@zmaj-js/orm-engine"
import { SequelizeService } from "./sq.service"

export const sqOrmProvider: OrmProvider = (params) => {
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
}
