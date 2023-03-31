import { allMockCollectionDefs } from "@zmaj-js/test-utils"
import { objectify } from "radash"
import { vi } from "vitest"
import { InfraStateService } from "./infra-state.service"

export function mockInfraStateService(): InfraStateService {
	const state = new InfraStateService({} as any, {} as any, {} as any)
	state["_collections"] = structuredClone(objectify(allMockCollectionDefs, (c) => c.collectionName))
	state.initializeState = vi.fn(async () => {})
	return state
}
