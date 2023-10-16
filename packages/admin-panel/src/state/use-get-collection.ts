import { CollectionDef } from "@zmaj-js/common"
import { useMemo } from "react"
import { useInfraState } from "./useInfraState"

export function useGetCollection(collectionName: string): CollectionDef | undefined {
	const infra = useInfraState()
	return useMemo(
		() => infra.data.find((c) => c.collectionName === collectionName),
		[infra.data, collectionName],
	)
}
