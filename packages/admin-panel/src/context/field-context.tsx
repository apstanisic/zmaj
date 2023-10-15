import { FieldDef } from "@zmaj-js/common"
import { useResourceCollection } from "../hooks/use-resource-collection"
import { generateContext } from "../utils/generate-context"

export const [FieldContextProvider, useFieldContext] = generateContext<FieldDef | undefined>(
	undefined,
)

export function useFieldContext2(name: string) {
	const col = useResourceCollection()
	const field = col.fields[name]
	if (!field) throw new Error("3289900")
	return field
}
