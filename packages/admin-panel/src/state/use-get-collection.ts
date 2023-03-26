import { CollectionDef } from "@zmaj-js/common"
import { camel } from "radash"
import { useMemo } from "react"
import { useInfraState } from "./useInfraState"

/**
 *
 * @param table Table or collection name
 * @returns
 */
export function useGetCollectionByTable(table: string): CollectionDef | undefined {
	const infra = useInfraState()
	return useMemo(() => infra.data.find((c) => c.tableName === table), [infra.data, table])
}

export function useGetCollection(collectionName: string): CollectionDef | undefined {
	const infra = useInfraState()
	return useMemo(
		() => infra.data.find((c) => c.collectionName === collectionName),
		[infra.data, collectionName],
	)
}
