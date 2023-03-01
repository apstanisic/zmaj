import { CollectionDef } from "@zmaj-js/common"
import { camel } from "radash"
import { useMemo } from "react"
import { useInfraState } from "./useInfraState"

/**
 *
 * @param table Table or collection name
 * @returns
 */
export function useGetCollection(table: string): CollectionDef | undefined {
	const infra = useInfraState()
	return useMemo(
		() => infra.data.find((c) => c.collectionName === camel(table)),
		[infra.data, table],
	)
}
