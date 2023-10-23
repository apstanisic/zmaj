import { useRecord } from "@admin-panel/hooks/use-record"
import { useCreatePath, useResourceDefinition } from "ra-core"

export function useVisitManyToOneHref(): string | undefined {
	const createPath = useCreatePath()
	const { hasShow, name } = useResourceDefinition()
	const record = useRecord()

	if (!hasShow) return
	return createPath({ resource: name, type: "show", id: record?.id })
}
