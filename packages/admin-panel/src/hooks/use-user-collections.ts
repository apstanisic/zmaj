import { CollectionDef } from "@zmaj-js/common"
import { useMemo } from "react"
import { useInfraState } from "../state/useInfraState"

export function useUserCollections(): CollectionDef[] {
	const infra = useInfraState()
	return useMemo(() => infra.data.filter((c) => !c.tableName.startsWith("zmaj")), [infra.data])
}
