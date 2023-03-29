import { allMockCollectionDefs, allMockFieldDefs, allMockRelationDefs } from "@zmaj-js/test-utils"
import { vi } from "vitest"
import { InfraStateService } from "./infra-state.service"

export function mockInfraStateService(): InfraStateService {
	const state = new InfraStateService({} as any, {} as any, {} as any)
	state["_nonSystemCollections"] = structuredClone(allMockCollectionDefs)
	state["_fields"] = structuredClone(allMockFieldDefs)
	state["_relations"] = structuredClone(allMockRelationDefs)
	const allCollections = structuredClone([
		...state["_nonSystemCollections"],
		...state["_systemCollections"],
	])
	state["_collections"] = structuredClone(
		Object.fromEntries(allCollections.map((c) => [c.collectionName, c])),
	)
	state.initializeState = vi.fn(async () => {})
	return state
}
