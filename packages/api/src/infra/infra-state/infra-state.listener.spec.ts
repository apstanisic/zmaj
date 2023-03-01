import { Test } from "@nestjs/testing"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { InfraStateListener } from "./infra-state.listener"
import { InfraStateService } from "./infra-state.service"

describe("InfraStateListener", () => {
	let service: InfraStateListener
	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				InfraStateListener,
				{ provide: InfraStateService, useValue: { initializeState: vi.fn() } },
			],
		}).compile()

		service = module.get(InfraStateListener)
	})

	it("should compile", () => {
		expect(service).toBeDefined()
	})

	it("should do nothing on read", async () => {
		await service.onChange({ action: "read" } as any)
		expect(service["state"].initializeState).not.toBeCalled()
	})

	it("should do nothing on non infra collection", async () => {
		await service.onChange({ action: "update", collection: { tableName: "other" } } as any)
		expect(service["state"].initializeState).not.toBeCalled()
	})

	it("should refresh state on infra change", async () => {
		await service.onChange({
			action: "update",
			collection: { tableName: "zmaj_field_metadata" },
		} as any)
		expect(service["state"].initializeState).toBeCalled()
	})
})
