import { buildTestModule } from "@api/testing/build-test-module"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { KeyValueStorageService } from "./key-value-storage.service"

describe("KeyValueStorageService", () => {
	let service: KeyValueStorageService

	beforeEach(async () => {
		const module = await buildTestModule(KeyValueStorageService).compile()
		service = module.get<KeyValueStorageService>(KeyValueStorageService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("repo", () => {
		it("should have proper repo", () => {
			expect(service["repo"]).toEqual({ testId: "REPO_zmaj_key_value" })
		})
	})

	describe("findByKey", () => {
		const findOne = vi.fn().mockResolvedValue("value")

		beforeEach(() => {
			service["repo"].findOne = findOne
		})

		it("should find proper value", async () => {
			const res = await service.findByKey("key1", "namespace1")
			expect(findOne).toBeCalledWith({
				where: {
					key: "key1",
					namespace: "namespace1",
					$or: [{ expiresAt: { $lte: expect.any(Date) } }, { expiresAt: null }],
				},
				trx: undefined,
			})
		})

		it("should default to no namespace", async () => {
			const res = await service.findByKey("key1")
			expect(findOne).toBeCalledWith({
				where: {
					key: "key1",
					namespace: null,
					$or: [{ expiresAt: { $lte: expect.any(Date) } }, { expiresAt: null }],
					trx: undefined,
				},
			})
		})

		it("should return value from db", async () => {
			const res = await service.findByKey("key1")
			expect(res).toBe("value")
		})
	})

	/**
	 *
	 */
	describe("create", () => {
		beforeEach(() => {
			service["repo"].createOne = vi.fn().mockResolvedValue("value from db")
		})

		it("should throw on invalid data", async () => {
			await expect(service.create({} as any)).rejects.toThrow(Error)
		})

		it("should save data in db", async () => {
			await service.create({ key: "test", value: "value" }, 5 as never)
			expect(service["repo"].createOne).toBeCalledWith({
				data: expect.objectContaining({ key: "test", value: "value" }),
				trx: 5,
			})
		})
		it("should return saved data", async () => {
			const res = await service.create({ key: "hello", value: "world" })
			expect(res).toEqual("value from db")
		})
	})
})
