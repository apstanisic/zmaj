import { DynamicModule, Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { systemCollections } from "@zmaj-js/common"
import { AlterSchemaService, Orm } from "@zmaj-js/orm"
import { CliDbModule } from "./bootstrap-cli-db"

@Module({})
class CliUninstallZmajModule {
	static forRoot(envPath: string): DynamicModule {
		return {
			module: CliUninstallZmajModule,
			global: true,
			imports: [CliDbModule.forRoot(envPath)],
		}
	}
}
/**
 * Delete all Zmaj tables
 */
export async function uninstallZmajCli(envPath: string): Promise<void> {
	const app = await NestFactory.create(CliUninstallZmajModule.forRoot(envPath), {
		logger: ["error"],
	})
	app.enableShutdownHooks()
	try {
		const orm = app.get(Orm)
		const alter = app.get(AlterSchemaService)

		await orm.transaction({
			fn: async (trx) => {
				for (const col of systemCollections) {
					await alter.dropTable({ tableName: col.tableName, trx })
				}
			},
		})
	} finally {
		await app.close()
	}
}
