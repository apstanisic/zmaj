import { DynamicModule, Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { MigrationsConfig } from "../migrations/migrations.config"
import { MigrationsService } from "../migrations/migrations.service"
import { MigrationsUmzugStorage } from "../migrations/migrations.umzug-storage"
import { CliDbModule } from "./bootstrap-cli-db"

@Module({})
class CliMigrationsModule {
	static forRoot(envPath: string): DynamicModule {
		return {
			module: CliMigrationsModule,
			global: true,
			imports: [CliDbModule.forRoot(envPath)],
			providers: [
				MigrationsService,
				MigrationsUmzugStorage,
				{
					provide: MigrationsConfig,
					useValue: new MigrationsConfig({ autoRunMigrations: true }),
				},
			],
		}
	}
}
/**
 * This enables us to run migrations without bootstraping the whole app.
 * It also enables us to run migrations even if app is in invalid state.
 */
export async function runCliMigrations(envPath: string): Promise<void> {
	const app = await NestFactory.create(CliMigrationsModule.forRoot(envPath), { logger: ["error"] })
	app.enableShutdownHooks()
	await app.get(MigrationsService).sync()
	await app.close()
}
