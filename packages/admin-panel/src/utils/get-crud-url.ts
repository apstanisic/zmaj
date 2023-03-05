import { RaAction } from "@admin-panel/types/RaAction"
import { CollectionDef, isStruct } from "@zmaj-js/common"

export function getCrudUrl(collection: string | CollectionDef, action?: "list" | "create"): string
export function getCrudUrl(
	collection: string | CollectionDef,
	action: "show" | "edit",
	id?: string,
): string
export function getCrudUrl(
	collection: string | CollectionDef,
	action: RaAction = "list",
	id?: string,
): string {
	let path = isStruct(collection) ? `/${collection.collectionName}` : `/${collection ?? "unknown"}`
	switch (action) {
		case "create":
			path += "/create"
			break
		case "edit":
			path += `/${id}`
			break
		case "show":
			path += `/${id}/show`
			break
		case "list":
		default:
	}

	return path
}
