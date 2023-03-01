import { CollectionDef } from "@zmaj-js/common"
import { generateContext } from "../utils/generate-context"

export const [CollectionContextProvider, useCollectionContext] = generateContext<CollectionDef>(
	undefined,
	{ throwOnNil: true }, //
)
