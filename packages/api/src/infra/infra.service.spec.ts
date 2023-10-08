import { BootstrapOrm } from "@api/database/BootstrapOrm"
import { buildTestModule } from "@api/testing/build-test-module"
import { CollectionMetadataModel, FieldMetadataModel, RelationMetadataModel } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraService } from "./infra.service"

describe("InfraService", () => {
	let service: InfraService
	let bootOrm: BootstrapOrm
	beforeEach(async () => {
		const module = await buildTestModule(InfraService).compile()
		service = module.get(InfraService)

		bootOrm = module.get(BootstrapOrm)
		bootOrm.getRepo(CollectionMetadataModel).findWhere = vi.fn(async () => [1 as any])
		bootOrm.getRepo(FieldMetadataModel).findWhere = vi.fn(async () => [2 as any])
		bootOrm.getRepo(RelationMetadataModel).findWhere = vi.fn(async () => [3 as any])
	})

	describe("getCollectionMetadata", () => {
		it("should get collections", async () => {
			const res = await service.getCollectionMetadata()
			expect(res).toEqual([1])
		})
	})

	describe("getFieldMetadata", () => {
		it("should get fields", async () => {
			const res = await service.getFieldMetadata()
			expect(res).toEqual([2])
		})
	})

	describe("getRelationMetadata", () => {
		it("should get relations", async () => {
			const res = await service.getRelationMetadata()
			expect(res).toEqual([3])
		})
	})
})
