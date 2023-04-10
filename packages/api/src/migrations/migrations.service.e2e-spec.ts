import { ConfigModuleConfig } from "@api/config/config.config"
import { DatabaseConfig } from "@api/database/database.config"
import { BootstrapRepoManager } from "@api/database/BootstrapRepoManager"
import { RepoManager } from "@zmaj-js/orm"
import { AlterSchemaService } from "@zmaj-js/orm"
import { SchemaInfoService } from "@zmaj-js/orm"
import { getE2ETestModule } from "@api/testing/e2e-test-module"
import { getTestEnvValues } from "@api/testing/get-test-env-values"
import { DbMigration, DbMigrationCollection, systemCollections, uuidRegex } from "@zmaj-js/common"
import { SequelizeService } from "@zmaj-js/orm"
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
	let repoManager: BootstrapRepoManager
	//
	beforeAll(async () => {
		getTestEnvValues()
		sq = new SequelizeService(
			new DatabaseConfig(
				{},
				new ConfigService(new ConfigModuleConfig({ useEnvFile: true, envPath: ".env.test" })),
			),
		)
		await sq.initCms(systemCollections)
		schemaInfo = sq.schemaInfo
		alterSchema = sq.alterSchema
		repoManager = sq.repoManager
	})
	afterAll(async () => {
		await alterSchema.dropTable({ tableName })
		await repoManager.getRepo(DbMigrationCollection).deleteWhere({ where: {} })
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
				.getRepo(DbMigrationCollection)
				.findWhere({ where: { type: "user" } })
			await api.close()

			const created = await schemaInfo.hasTable(tableName)
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
