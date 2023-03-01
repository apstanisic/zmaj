import { WritableDeep } from "type-fest"
import { CollectionDef } from "./collection-def.type"

export function modifyCollection<T extends CollectionDef>(
	collection: T,
	change: (data: WritableDeep<T>) => void,
): T {
	const cloned = structuredClone(collection)
	change(cloned as any)
	return cloned
}
