import { buildTestModule } from "@api/testing/build-test-module"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RepoManager } from "@zmaj-js/orm"
import { MigrationsUmzugStorage } from "./migrations.umzug-storage"

describe("MigrationsUmzugStorage", () => {
	let storage: MigrationsUmzugStorage
	let repoManager: RepoManager

	beforeEach(async () => {
		const module = await buildTestModule(MigrationsUmzugStorage).compile()
		storage = module.get(MigrationsUmzugStorage)
		repoManager = module.get(RepoManager)
		storage.repo = {} as any
	})

	describe("logMigration", () => {
		beforeEach(async () => {
			storage.repo.createOne = vi.fn()
		})

		// used for system migrations
		it("should save migration in db", async () => {
			await storage.logMigration({
				name: "HelloWorld",
				context: { type: "system", trx: "TRX" as any },
			})
			expect(storage.repo.createOne).toBeCalledWith({
				data: { name: "HelloWorld", type: "system" },
				trx: "TRX",
			})
		})
	})

	describe("unlogMigration", () => {
		beforeEach(() => {
			storage.repo.deleteWhere = vi.fn()
		})
		it("should delete migration from db", async () => {
			const trx = "TRX_SQ" as any
			await storage.unlogMigration({ name: "ToDrop", context: { type: "user", trx } })

			expect(storage.repo.deleteWhere).toBeCalledWith({
				where: { name: "ToDrop", type: "user" },
				trx,
			})
		})
	})

	describe("executed", () => {
		beforeEach(async () => {
			storage.repo.findWhere = vi.fn().mockResolvedValue([{ name: "v1" }, { name: "mig2" }])
		})

		it("should get executed migration", async () => {
			const trx = "TRX_SQ" as any
			const res = await storage.executed({ context: { type: "system", trx } })

			expect(storage.repo.findWhere).toBeCalledWith({
				where: { type: "system" },
				trx,
				orderBy: { name: "ASC" },
			})
			expect(res).toEqual(["v1", "mig2"])
		})
	})
})
