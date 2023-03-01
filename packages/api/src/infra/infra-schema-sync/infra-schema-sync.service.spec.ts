import { buildTestModule } from "@api/testing/build-test-module"
import { asMock } from "@zmaj-js/common"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraSchemaCollectionsSyncService } from "./infra-schema-collections-sync.service"
import { InfraSchemaFieldsSyncService } from "./infra-schema-fields-sync.service"
import { InfraSchemaRelationsSyncService } from "./infra-schema-relations-sync.service"
import { InfraSchemaSyncService } from "./infra-schema-sync.service"

describe("InfraSchemaSyncService", () => {
	let service: InfraSchemaSyncService
	let fieldsS: InfraSchemaFieldsSyncService
	let relationsS: InfraSchemaRelationsSyncService
	let collectionsS: InfraSchemaCollectionsSyncService

	beforeEach(async () => {
		const module = await buildTestModule(InfraSchemaSyncService).compile()
		//
		service = module.get(InfraSchemaSyncService)
		//
		fieldsS = module.get(InfraSchemaFieldsSyncService)
		relationsS = module.get(InfraSchemaRelationsSyncService)
		collectionsS = module.get(InfraSchemaCollectionsSyncService)

		fieldsS.sync = vi.fn()
		relationsS.sync = vi.fn()
		collectionsS.sync = vi.fn()
	})

	describe("sync", () => {
		it("should sync in correct order", async () => {
			const fs = asMock(fieldsS.sync)
			const rs = asMock(relationsS.sync)
			const cs = asMock(collectionsS.sync)
			await service.sync()

			// col before fields
			expect(cs.mock.invocationCallOrder.at(0)).toBeLessThan(fs.mock.invocationCallOrder.at(0)!)
			// fields before rel
			expect(fs.mock.invocationCallOrder.at(0)).toBeLessThan(rs.mock.invocationCallOrder.at(0)!)
		})
	})
})
