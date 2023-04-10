import { ActivityLogConfigParams } from "@api/activity-log/activity-log.config"
import { SecurityConfigParams } from "@api/app/security.config"
import { type CrudConfigParams } from "@api/crud/crud.config"
import { type FilesConfigParams } from "@api/files/files.config"
import { InfraConfigParams } from "@api/infra/infra.config"
import { AuthenticationConfigParams } from "../authentication/authentication.config"
import { AuthorizationParams } from "../authorization/authorization.module"
import { ConfigModuleParams } from "../config/config.config"
import type { DatabaseConfigParams } from "@zmaj-js/orm"
import { EmailConfigParams } from "../email/email.config"
import { MigrationsConfigParams } from "../migrations/migrations.config"
import { RedisConfigParams } from "../redis/redis.config"
import { StorageConfigParams } from "../storage/storage.config"
import { CustomModule, CustomProvider } from "./custom-modules.module"
import { GlobalConfigParams } from "./global-app.config"

export type ConfigureAppParams = {
	/** Any external modules that user wants */
	customModules?: CustomModule[]
	/** User can pass services directly */
	customProviders?: CustomProvider[]
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
	infra?: InfraConfigParams
}
