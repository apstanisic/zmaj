import { DynamicModule, Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { systemCollections } from "@zmaj-js/common"
import { CliDbModule } from "./bootstrap-cli-db"
import { AlterSchemaService } from "@zmaj-js/orm"
import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"

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
		const repoM = app.get(BootstrapRepoManager)
		const alter = app.get(AlterSchemaService)

		await repoM.transaction({
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
