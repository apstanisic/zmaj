import { BootstrapRepoManager } from "@api/database/orm-specs/BootstrapRepoManager"
import { buildTestModule } from "@api/testing/build-test-module"
import {
	CollectionMetadataCollection,
	FieldMetadataCollection,
	RelationMetadataCollection,
} from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraService } from "./infra.service"

describe("InfraService", () => {
	let service: InfraService
	let bootRepoManager: BootstrapRepoManager
	beforeEach(async () => {
		const module = await buildTestModule(InfraService).compile()
		service = module.get(InfraService)

		bootRepoManager = module.get(BootstrapRepoManager)
		bootRepoManager.getRepo(CollectionMetadataCollection).findWhere = vi.fn(async () => [1 as any])
		bootRepoManager.getRepo(FieldMetadataCollection).findWhere = vi.fn(async () => [2 as any])
		bootRepoManager.getRepo(RelationMetadataCollection).findWhere = vi.fn(async () => [3 as any])
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
