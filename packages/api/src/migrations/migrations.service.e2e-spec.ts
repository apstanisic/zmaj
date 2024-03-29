import { ConfigModuleConfig } from "@api/config/config.config"
import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { DatabaseConfig } from "@api/database/database.config"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { getTestEnvValues } from "@api/testing/get-test-env-values"
import { DbMigration, DbMigrationModel, systemModels, uuidRegex } from "@zmaj-js/common"
import { AlterSchemaService, Orm, RepoManager, SchemaInfoService } from "@zmaj-js/orm"
import { SequelizeService, snakeCaseNaming, sqOrmEngine } from "@zmaj-js/orm-sq"
import { join } from "node:path"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { ConfigService } from "../config/config.service"
import { type UserMigration } from "./migrations.types"

const tableName = "db_migrations_e2e"

const migration: UserMigration = {
	type: "user",
	name: "2022_01_01_01_01_01__create_test",
	up: async (execute) =>
		execute("CREATE TABLE db_migrations_e2e (id SERIAL PRIMARY KEY, name TEXT);"),
	down: async (execute) => execute("DROP TABLE IF EXISTS db_migrations_e2e;"),
}

describe("MigrationsService e2e", () => {
	let sq: SequelizeService
	let schemaInfo: SchemaInfoService
	let alterSchema: AlterSchemaService
	let orm: BootstrapOrm
	//
	beforeAll(async () => {
		const root = join(process.cwd(), "../..")

		getTestEnvValues(root)
		orm = new Orm({
			config: new DatabaseConfig(
				{},
				new ConfigService(new ConfigModuleConfig({ envPath: join(root, ".env.test") })),
			),
			engine: sqOrmEngine,
			models: [...systemModels],
			naming: snakeCaseNaming,
		})
		await orm.init()
		sq = orm.engine.engineProvider as SequelizeService
		schemaInfo = sq.schemaInfo
		alterSchema = sq.alterSchema
	})
	afterAll(async () => {
		await alterSchema.dropTable({ tableName })
		await orm.getRepo(DbMigrationModel).deleteWhere({ where: {} })
		await sq.onModuleDestroy()
	})

	describe("Run user migrations", () => {
		beforeEach(async () => {
			await alterSchema.dropTable({ tableName })
		})

		it("should run user migrations", async () => {
			const api = await getE2ETestModule({
				migrations: {
					autoRunMigrations: true,
					autoRunUserMigrations: true,
					migrations: [migration],
				},
			})
			const migrations = await api
				.get(RepoManager)
				.getRepo(DbMigrationModel)
				.findWhere({ where: { type: "user" } })
			await api.close()

			const created = await schemaInfo.hasTable({ table: tableName })
			expect(created).toEqual(true)
			expect(migrations).toEqual<DbMigration[]>([
				{
					id: expect.stringMatching(uuidRegex),
					// down: null,
					// up: null,
					// executedAt: expect.any(Date) as any,
					name: migration.name,
					type: "user",
				},
			])
		})
	})
})
