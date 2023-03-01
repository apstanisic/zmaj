import { ActivityLogConfigParams } from "@api/activity-log/activity-log.config"
import { SecurityConfigParams } from "@api/app/security.config"
import { type CrudConfigParams } from "@api/crud/crud.config"
import { type FilesConfigParams } from "@api/files/files.config"
import { AuthenticationConfigParams } from "../authentication/authentication.config"
import { AuthorizationParams } from "../authorization/authorization.module"
import { ConfigModuleParams } from "../config/config.config"
import { DatabaseConfigParams } from "../database/database.config"
import { EmailConfigParams } from "../email/email.config"
import { MigrationsConfigParams } from "../migrations/migrations.config"
import { RedisConfigParams } from "../redis/redis.config"
import { StorageConfigParams } from "../storage/storage.config"
import { CustomModule, CustomProvider } from "./custom-modules.module"
import { GlobalConfigParams } from "./global-app.config"

// prevents immer from freezing object as it leads to problems with MikroORM
// setAutoFreeze(false)

export type ConfigureAppParams = {
	/**
	 * Any external modules that user wants
	 */
	customModules?: CustomModule[]
	customProviders?: CustomProvider[]
	//
	config?: ConfigModuleParams

	global?: GlobalConfigParams
	crud?: CrudConfigParams
	authentication?: AuthenticationConfigParams
	authorization?: AuthorizationParams
	// cache?: CacheConfigParams
	email?: EmailConfigParams
	database?: DatabaseConfigParams
	redis?: RedisConfigParams
	storage?: StorageConfigParams
	activityLog?: ActivityLogConfigParams
	files?: FilesConfigParams
	migrations?: MigrationsConfigParams
	security?: SecurityConfigParams
}
