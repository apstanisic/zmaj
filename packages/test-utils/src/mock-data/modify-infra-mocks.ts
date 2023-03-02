import { CollectionDef } from "@zmaj-js/common"
import { allMockCollectionDefs } from "./mock-collection-defs.js"

export function modifyTestInfra(fn: (draft: CollectionDef[]) => void): CollectionDef[] {
	const toReturn = structuredClone(allMockCollectionDefs)
	fn(toReturn)
	return toReturn
}
