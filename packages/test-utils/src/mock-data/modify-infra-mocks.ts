import { CollectionDef } from "@zmaj-js/common"
import { produce, setAutoFreeze } from "immer"
import { WritableDeep } from "type-fest"
import { allMockCollectionDefs } from "./mock-collection-defs.js"

setAutoFreeze(false)

/**
 * @deprecated Get rid of this
 */
export function modifyTestInfra(
	fn: (draft: WritableDeep<CollectionDef[]>) => void,
): CollectionDef[] {
	return produce(allMockCollectionDefs, (draft) => {
		fn(draft as any)
	})
}
