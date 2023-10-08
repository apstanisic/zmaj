import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { buildTestModule } from "@api/testing/build-test-module"
import { BadRequestException } from "@nestjs/common"
import { Orm } from "@zmaj-js/orm"
import { SequelizeService } from "@zmaj-js/orm-sq"
import { MigrationError } from "umzug"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MigrationsService } from "./migrations.service"
import { SystemMigration } from "./migrations.types"
import { MigrationsUmzugStorage } from "./migrations.umzug-storage"
import { CreateMigrationsTable } from "./system-migrations/000_migrations"
import { systemMigrations } from "./system-migrations/mod"

describe("MigrationsService", () => {
	let service: MigrationsService
	let storage: MigrationsUmzugStorage
	let sqService: SequelizeService
	let orm: Orm

	beforeEach(async () => {
		const module = await buildTestModule(MigrationsService).compile()
		service = module.get(MigrationsService)
		storage = module.get(MigrationsUmzugStorage)
		sqService = module.get(SequelizeService)
		sqService.orm ??= {} as any
		sqService.orm.getQueryInterface ??= vi.fn(() => ({}) as any)
		orm = module.get(BootstrapOrm)
		orm.transaction = vi.fn(async (v) => v.fn("TRX" as any))
		orm.rawQuery = vi.fn(async (v) => [])
	})

	describe("sync", () => {
		beforeEach(() => {
			service["config"].autoRunMigrations = true
			service["config"].autoRunUserMigrations = true

			service["ensureMigrationsTableExist"] = vi.fn()
			service["runSystemMigrations"] = vi.fn()
			service["runUserMigrations"] = vi.fn()
		})

		it("should not do anything if not allowed ", async () => {
			service["config"].autoRunMigrations = false
			await service.sync()
			expect(service["ensureMigrationsTableExist"]).not.toBeCalled()
			expect(service["runSystemMigrations"]).not.toBeCalled()
		})

		it("should run all", async () => {
			await service.sync()

			expect(service["ensureMigrationsTableExist"]).toBeCalled()
			expect(service["runSystemMigrations"]).toBeCalled()
			expect(service["runUserMigrations"]).toBeCalled()
		})

		it("should run only system", async () => {
			service["config"].autoRunUserMigrations = false
			await service.sync()

			expect(service["ensureMigrationsTableExist"]).toBeCalled()
			expect(service["runSystemMigrations"]).toBeCalled()
			expect(service["runUserMigrations"]).not.toBeCalled()
		})
	})

	//
	describe("ensureMigrationsTableExist", () => {
		const hasTable = vi.fn(async () => true)
		// const trx = { schema: { hasTable } }
		beforeEach(() => {
			service["schemaInfo"].hasTable = hasTable
			CreateMigrationsTable.up = vi.fn()
		})
		//
		it("should do nothing if migration table exist", async () => {
			await service.ensureMigrationsTableExist()
			expect(CreateMigrationsTable.up).not.toBeCalled()
		})

		it("should create migrations table if table does not exist", async () => {
			hasTable.mockResolvedValue(false)
			await service.ensureMigrationsTableExist()
			expect(CreateMigrationsTable.up).toBeCalled()
		})
	})

	describe("runSystemMigrations", () => {
		beforeEach(() => {
			service["runMigrations"] = vi.fn(async () => {})
		})
		it("should run system migrations", async () => {
			await service["runSystemMigrations"]()
			expect(service["runMigrations"]).toBeCalledWith("system", systemMigrations)
		})
	})

	describe("executeMigration", () => {
		it("should run text migration", async () => {
			await service["executeMigration"]({ type: "user", trx: "TextTrx" as any }, "SELECT 1")

			expect(orm.rawQuery).toBeCalledWith("SELECT 1", { trx: "TextTrx" })
		})

		it("should run function migration", async () => {
			const fn = vi.fn((executeMigration: (v: string) => Promise<void>, other: any) =>
				executeMigration("SELECT 2"),
			)
			await service["executeMigration"]({ type: "user", trx: "FnTrx" as any }, fn)
			expect(orm.rawQuery).toBeCalledWith("SELECT 2", { trx: "FnTrx" })
		})
	})

	describe("runMigrations", () => {
		let migration: SystemMigration

		beforeEach(async () => {
			service["executeMigration"] = vi.fn()
			service["ensureMigrationsTableExist"] = vi.fn()
			migration = {
				type: "system",
				up: "SELECT 5",
				name: "hello" as any,
			}

			storage.executed = vi.fn(async () => [])
			storage.logMigration = vi.fn()
			storage.unlogMigration = vi.fn()
		})

		it("should ensure that migrations tables exists", async () => {
			orm.transaction = vi.fn(async ({ fn }) => fn("TRX" as any))
			await service.runMigrations("system", [migration])
			expect(service["ensureMigrationsTableExist"]).toBeCalled()
		})

		it("should create transaction for migrations", async () => {
			// if transaction does nothing, nothing happens
			orm.transaction = vi.fn(async () => undefined as any)
			await service.runMigrations("system", [migration])
			expect(service["executeMigration"]).not.toBeCalled()
			orm.transaction = vi.fn(async (v) => v.fn("TRX" as any))
			await service.runMigrations("system", [migration])
			expect(service["executeMigration"]).toBeCalled()
		})

		it("should revert transaction if there are errors", async () => {
			service["executeMigration"] = vi.fn().mockRejectedValue(new BadRequestException())

			orm.transaction = vi.fn((params) =>
				params.fn("TRX" as any).catch((err) => {
					expect(err).toBeInstanceOf(MigrationError)
					throw err
				}),
			)

			try {
				await service.runMigrations("system", [migration])
			} catch (error) {
				expect(error).toBeInstanceOf(BadRequestException)
			}

			expect.assertions(2)
		})
	})
})
