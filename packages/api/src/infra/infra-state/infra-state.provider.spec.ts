import { describe, expect, it, vi } from "vitest"
import { InfraStateProvider } from "./infra-state.provider"
import { InfraStateService } from "./infra-state.service"

vi.mock("./infra-state.service", () => ({
	InfraStateService: class {
		initializeState = vi.fn()
	},
}))

describe("InfraStateProvider", () => {
	it("should initialize state before returning it to user", async () => {
		const service: InfraStateService = await InfraStateProvider.useFactory()
		expect(service.initializeState).toBeCalled()
	})
})
