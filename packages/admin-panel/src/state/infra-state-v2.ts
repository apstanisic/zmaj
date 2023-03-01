import { CollectionDef } from "@zmaj-js/common"
import { useMemo } from "react"
import { useInfraState } from "./useInfraState"

export function useInfraTables(): string[] {
	const infra = useInfraState()
	return useMemo(() => infra.data.map((c) => c.tableName), [infra.data])
}

export function useNonSystemCollections(): CollectionDef[] {
	const infra = useInfraState()
	return useMemo(() => infra.data.filter((c) => !c.tableName.startsWith("zmaj")), [infra.data])
}
