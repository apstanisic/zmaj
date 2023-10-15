import { CollectionDef } from "@zmaj-js/common"
import { ResourceOptions, useResourceDefinition } from "ra-core"

export function useResourceCollection(): CollectionDef {
	const resource = useResourceDefinition<ResourceOptions>()
	const collection = resource?.options?.collection
	if (!collection) throw new Error("543990")
	return collection
}
