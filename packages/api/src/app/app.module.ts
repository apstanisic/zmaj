import { ActivityLogModule } from "@api/activity-log/activity-log.module"
import { AdminPanelInfoModule } from "@api/admin-panel-wip/admin-panel-info.module"
import { SecurityConfig } from "@api/app/security.config"
import { AuthenticationModule } from "@api/authentication/authentication.module"
import { CollectionsEndpointModule } from "@api/collections-endpoint/collections-endpoint.module"
import { CrudModule } from "@api/crud/crud.module"
import { FilesModule } from "@api/files/files.module"
import { InfraSchemaSyncModule } from "@api/infra/infra-schema-sync/infra-schema-sync.module"
import { InfraStateModule } from "@api/infra/infra-state/infra-state.module"
import { InfraModule } from "@api/infra/infra.module"
import { KeyValueStorageModule } from "@api/key-value-storage/key-value-storage.module"
import { MigrationsModule } from "@api/migrations/migrations.module"
import { OrmModule } from "@api/orm/orm.module"
import { RuntimeSettingsModule } from "@api/runtime-settings/runtime-settings.module"
import { SecurityTokensModule } from "@api/security-tokens/security-tokens.module"
import { SequelizeModule } from "@api/sequelize/sequelize.module"
import { StorageModule } from "@api/storage/storage.module"
import { TranslationsModule } from "@api/translations/translations.module"
import { UsersModule } from "@api/users/users.module"
import { WebhooksModule } from "@api/webhooks/webhooks.module"
import { DynamicModule, Global, Logger, Module } from "@nestjs/common"
import { NestApplication } from "@nestjs/core"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { AuthorizationModule } from "../authorization/authorization.module"
import { CommonModule } from "../common"
import { AppConfigModule } from "../config/config.module"
import { ConfigService } from "../config/config.service"
import { DatabaseModule } from "../database/database.module"
import { EmailModule } from "../email/email.module"
import { EncryptionModule } from "../encryption/encryption.module"
import { HttpClientModule } from "../http-client/http-client.module"
import { RedisModule } from "../redis/redis.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ConfigureAppParams } from "./configure-app-params.type"
import { ExternalModule } from "./custom-modules.module"
import { GlobalConfig } from "./global-app.config"
import { GlobalProvidersModule } from "./global-providers.module"

@Global()
@Module({})
export class AppModule {
	static register(params: ConfigureAppParams = {}): DynamicModule {
		return {
			module: AppModule,
			controllers: [AppController],
			exports: [GlobalConfig, SecurityConfig],
			providers: [
				AppService,
				{
					provide: Logger,
					useValue: new Logger(NestApplication.name),
				},
				{
					provide: GlobalConfig,
					inject: [ConfigService],
					useFactory: (config: ConfigService) => new GlobalConfig(params?.global ?? {}, config),
				},
				{
					provide: SecurityConfig,
					inject: [ConfigService],
					useFactory: (config: ConfigService) => new SecurityConfig(params?.security ?? {}, config),
				},
			],
			imports: [
				//
				EventEmitterModule.forRoot({
					global: true,
					wildcard: true,
					verboseMemoryLeak: true,
					maxListeners: 30, // there are some common events, 10 might be to small
				}),
				HttpClientModule,
				ScheduleModule.forRoot(),
				AppConfigModule.register(params?.config ?? {}), // ht
				RedisModule.register(params?.redis ?? {}),
				// AppCacheModule.register(params?.cache ?? {}), // nn
				CommonModule,
				EncryptionModule,
				EmailModule.register(params?.email ?? {}), // ht
				DatabaseModule.register(params?.database ?? {}),
				MigrationsModule.register(params.migrations ?? {}),
				StorageModule.register(params?.storage ?? {}),
				// //
				GlobalProvidersModule,
				SequelizeModule,
				InfraSchemaSyncModule,
				InfraModule,
				InfraStateModule,
				AuthenticationModule.register(params?.authentication ?? {}),
				AuthorizationModule.register(params?.authorization ?? {}),
				UsersModule,
				KeyValueStorageModule,
				RuntimeSettingsModule,
				SecurityTokensModule,
				CrudModule.register(params?.crud ?? {}),
				CollectionsEndpointModule,
				ActivityLogModule.register(params.activityLog ?? {}),
				OrmModule,
				WebhooksModule,
				TranslationsModule,
				FilesModule.register(params.files ?? {}),
				// only register if gui is enabled
				...(params.global?.enableAdminPanelIntegration ? [AdminPanelInfoModule] : []),
				ExternalModule.forRoot(params.customModules, params.customProviders),
			],
		}
	}
}
