import { AlterSchemaService } from "@api/database/schema/alter-schema.service"
import { buildTestModule } from "@api/testing/build-test-module"
import { ForbiddenException } from "@nestjs/common"
import { CollectionDef, CollectionCreateDto, CollectionUpdateDto, UUID } from "@zmaj-js/common"
import { CollectionDefStub, RelationDefStub } from "@zmaj-js/test-utils"
import { v4 } from "uuid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateService } from "../infra-state/infra-state.service"
import { OnInfraChangeService } from "../on-infra-change.service"
import { CollectionsService } from "./collections.service"

describe("CollectionsService", () => {
	let service: CollectionsService
	let appInfraSyncS: OnInfraChangeService
	let alterSchema: AlterSchemaService
	let infraState: InfraStateService

	beforeEach(async () => {
		const module = await buildTestModule(CollectionsService).compile()
		service = module.get(CollectionsService)

		infraState = module.get(InfraStateService)

		alterSchema = module.get(AlterSchemaService)

		appInfraSyncS = module.get(OnInfraChangeService)
		appInfraSyncS.syncAppAndDb = vi.fn()
		appInfraSyncS.executeChange = vi.fn(async (fn) => fn())
	})

	/**
	 *
	 */
	describe("updateCollection", () => {
		const id = v4() as UUID
		const dto = new CollectionUpdateDto({ label: "hello" })

		beforeEach(() => {
			service.repo.updateById = vi.fn().mockResolvedValue("updated")
		})

		it("should update relation in db ", async () => {
			await service.updateCollection(id, dto)
			expect(service.repo.updateById).toBeCalledWith({ id, changes: dto })
		})

		it("should sync state", async () => {
			await service.updateCollection(id, dto)
			expect(appInfraSyncS.executeChange).toBeCalled()
		})

		it("should return updated relation", async () => {
			const res = await service.updateCollection(id, dto)
			expect(res).toEqual("updated")
		})
	})

	/**
	 *
	 */
	describe("removeCollection", () => {
		const id = v4() as UUID
		let collection: CollectionDef

		beforeEach(() => {
			collection = CollectionDefStub()
			collection.relations = {}

			service.repo.deleteById = vi.fn().mockResolvedValue({ tableName: "deleted_table" })
			infraState.getCollection = vi.fn(() => collection as any)
			alterSchema.dropTable = vi.fn()
		})

		it("should throw if fk points to current relation", async () => {
			const rel = RelationDefStub({ type: "one-to-many" })
			collection.relations[rel.propertyName] = rel
			await expect(service.removeCollection(id)).rejects.toThrow(ForbiddenException)
		})

		it("should remove collection from db", async () => {
			await service.removeCollection(id)
			expect(service.repo.deleteById).toBeCalledWith({ id, trx: "TEST_TRX" })
		})

		it("should create migration to remove table from db", async () => {
			await service.removeCollection(id)
			expect(alterSchema.dropTable).toBeCalledWith(
				{ tableName: "deleted_table" },
				{ trx: "TEST_TRX" },
			)
		})

		it("should return deleted collection", async () => {
			const res = await service.removeCollection(id)
			expect(res).toEqual({ tableName: "deleted_table" })
		})
	})

	describe("createCollection", () => {
		const dto = CollectionCreateDto.fromPartial({
			tableName: "hello_world",
			pkColumn: "id1",
			pkType: "auto-increment",
		})

		beforeEach(() => {
			alterSchema.createTable = vi.fn()
			service.repo.createOne = vi.fn().mockImplementation(async (v: { data: any }) => v.data)
			service.fieldsRepo.createOne = vi.fn().mockImplementation(async (v: { data: any }) => v.data)
		})
		//

		it("should store info in db ", async () => {
			await service.createCollection(dto)
			expect(service.repo.createOne).toBeCalledWith({
				trx: "TEST_TRX",
				data: expect.objectContaining({ tableName: "hello_world" }),
			})
		})

		it("should create migration for new table", async () => {
			await service.createCollection(dto)
			expect(alterSchema.createTable).toBeCalledWith(
				{
					pkColumn: "id1",
					pkType: "auto-increment",
					tableName: "hello_world",
				},
				{ trx: "TEST_TRX" },
			)
		})

		it("migrate and sync infra state", async () => {
			await service.createCollection(dto)
			expect(appInfraSyncS.executeChange).toBeCalled()
		})

		it("should return created relation", async () => {
			const res = await service.createCollection(dto)
			expect(res).toMatchObject({ tableName: "hello_world" })
		})
	})
})
